using System.Security.Claims;
using LocacaoVeiculos.Api.Data;
using LocacaoVeiculos.Api.DTOs;
using LocacaoVeiculos.Api.Models;
using LocacaoVeiculos.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocacaoVeiculos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMinioService _minio;
    private static readonly string[] TiposImagemPermitidos = { "image/jpeg", "image/png", "image/webp" };

    public ClientesController(AppDbContext db, IMinioService minio)
    {
        _db = db;
        _minio = minio;
    }

    private Guid EmpresaId => Guid.Parse(User.FindFirstValue("empresaId")!);

    private static ClienteResponse ToResponse(Cliente c) => new(
        c.Id, c.Nome, c.DocumentoTipo, c.Documento, c.Email, c.Telefone, c.Endereco, c.CNH, c.ValidadeCNH,
        c.DocumentoImagemUrl, c.Ativo);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteResponse>>> Listar([FromQuery] string? busca)
    {
        var query = _db.Clientes.AsQueryable();
        if (!string.IsNullOrWhiteSpace(busca))
            query = query.Where(c => c.Nome.Contains(busca) || c.Documento.Contains(busca));

        var clientes = await query.OrderBy(c => c.Nome).ToListAsync();
        return Ok(clientes.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClienteResponse>> ObterPorId(Guid id)
    {
        var cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.Id == id);
        if (cliente is null) return NotFound();
        return Ok(ToResponse(cliente));
    }

    [HttpPost]
    public async Task<ActionResult<ClienteResponse>> Criar(ClienteRequest req)
    {
        var erro = ValidarCliente(req);
        if (erro is not null) return BadRequest(new { erro });

        if (await _db.Clientes.AnyAsync(c => c.Documento == LimparDocumento(req.Documento)))
            return Conflict(new { erro = "Já existe um cliente cadastrado com esse documento." });

        var cliente = new Cliente
        {
            EmpresaId = EmpresaId,
            Nome = req.Nome.Trim(),
            DocumentoTipo = req.DocumentoTipo,
            Documento = LimparDocumento(req.Documento),
            Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim(),
            Telefone = req.Telefone,
            Endereco = req.Endereco,
            CNH = req.CNH,
            ValidadeCNH = req.ValidadeCNH
        };

        _db.Clientes.Add(cliente);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(ObterPorId), new { id = cliente.Id }, ToResponse(cliente));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, ClienteRequest req)
    {
        var cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.Id == id);
        if (cliente is null) return NotFound();

        var erro = ValidarCliente(req);
        if (erro is not null) return BadRequest(new { erro });

        var documentoLimpo = LimparDocumento(req.Documento);
        if (await _db.Clientes.AnyAsync(c => c.Documento == documentoLimpo && c.Id != id))
            return Conflict(new { erro = "Já existe outro cliente cadastrado com esse documento." });

        cliente.Nome = req.Nome.Trim();
        cliente.DocumentoTipo = req.DocumentoTipo;
        cliente.Documento = documentoLimpo;
        cliente.Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim();
        cliente.Telefone = req.Telefone;
        cliente.Endereco = req.Endereco;
        cliente.CNH = req.CNH;
        cliente.ValidadeCNH = req.ValidadeCNH;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static string LimparDocumento(string documento) => System.Text.RegularExpressions.Regex.Replace(documento, @"[^\d]", "");

    private static string? ValidarCliente(ClienteRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Nome))
            return "Informe o nome do cliente.";

        if (req.DocumentoTipo != "CPF" && req.DocumentoTipo != "CNPJ")
            return "Tipo de documento inválido.";

        if (!Validadores.DocumentoValido(req.DocumentoTipo, req.Documento))
            return req.DocumentoTipo == "CPF" ? "CPF inválido. Confira os números digitados." : "CNPJ inválido. Confira os números digitados.";

        if (!string.IsNullOrWhiteSpace(req.Email) && !Validadores.EmailValido(req.Email))
            return "E-mail inválido.";

        if (req.ValidadeCNH.HasValue && req.ValidadeCNH.Value.Date < DateTime.UtcNow.Date && !string.IsNullOrWhiteSpace(req.CNH))
            return "A validade da CNH informada já está vencida - confira a data.";

        return null;
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id)
    {
        var cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.Id == id);
        if (cliente is null) return NotFound();

        cliente.Ativo = false; // soft delete: preserva histórico de contratos
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Envia (ou substitui) a foto do documento do cliente (RG, CNH, etc)
    [HttpPost("{id:guid}/documento")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<ClienteResponse>> EnviarDocumento(Guid id, IFormFile arquivo)
    {
        var cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.Id == id);
        if (cliente is null) return NotFound();

        if (arquivo is null || arquivo.Length == 0)
            return BadRequest(new { erro = "Nenhum arquivo enviado." });

        if (!TiposImagemPermitidos.Contains(arquivo.ContentType))
            return BadRequest(new { erro = "Formato de imagem não suportado. Use JPEG, PNG ou WEBP." });

        var objectNameAntigo = cliente.DocumentoImagemObjectName;

        await using var stream = arquivo.OpenReadStream();
        var objectName = await _minio.UploadArquivoAsync(stream, arquivo.FileName, arquivo.ContentType);

        cliente.DocumentoImagemUrl = _minio.ObterUrlPublica(objectName);
        cliente.DocumentoImagemObjectName = objectName;
        await _db.SaveChangesAsync();

        if (!string.IsNullOrEmpty(objectNameAntigo))
        {
            try { await _minio.RemoverArquivoAsync(objectNameAntigo); } catch { /* não trava a operação */ }
        }

        return Ok(ToResponse(cliente));
    }
}
