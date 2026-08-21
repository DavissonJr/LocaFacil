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
        var cliente = new Cliente
        {
            EmpresaId = EmpresaId,
            Nome = req.Nome,
            DocumentoTipo = req.DocumentoTipo,
            Documento = req.Documento,
            Email = req.Email,
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

        cliente.Nome = req.Nome;
        cliente.DocumentoTipo = req.DocumentoTipo;
        cliente.Documento = req.Documento;
        cliente.Email = req.Email;
        cliente.Telefone = req.Telefone;
        cliente.Endereco = req.Endereco;
        cliente.CNH = req.CNH;
        cliente.ValidadeCNH = req.ValidadeCNH;

        await _db.SaveChangesAsync();
        return NoContent();
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
            return BadRequest("Nenhum arquivo enviado.");

        if (!TiposImagemPermitidos.Contains(arquivo.ContentType))
            return BadRequest("Formato de imagem não suportado. Use JPEG, PNG ou WEBP.");

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
