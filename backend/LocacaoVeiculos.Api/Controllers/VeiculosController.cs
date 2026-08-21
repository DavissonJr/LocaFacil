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
public class VeiculosController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMinioService _minio;
    private static readonly string[] TiposImagemPermitidos = { "image/jpeg", "image/png", "image/webp" };

    public VeiculosController(AppDbContext db, IMinioService minio)
    {
        _db = db;
        _minio = minio;
    }

    private Guid EmpresaId => Guid.Parse(User.FindFirstValue("empresaId")!);

    private static VeiculoResponse ToResponse(Veiculo v) => new(
        v.Id, v.Placa, v.Marca, v.Modelo, v.AnoFabricacao, v.AnoModelo,
        v.Cor, v.Categoria, v.ValorDiaria, v.KmAtual, v.Status,
        v.Fotos.OrderBy(f => f.DataCriacao).Select(f => new VeiculoFotoResponse(f.Id, f.Url)).ToList());

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VeiculoResponse>>> Listar([FromQuery] string? status)
    {
        var query = _db.Veiculos.Include(v => v.Fotos).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(v => v.Status == status);

        var veiculos = await query.OrderBy(v => v.Marca).ThenBy(v => v.Modelo).ToListAsync();
        return Ok(veiculos.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VeiculoResponse>> ObterPorId(Guid id)
    {
        var veiculo = await _db.Veiculos.Include(v => v.Fotos).FirstOrDefaultAsync(v => v.Id == id);
        if (veiculo is null) return NotFound();
        return Ok(ToResponse(veiculo));
    }

    [HttpPost]
    public async Task<ActionResult<VeiculoResponse>> Criar(VeiculoRequest req)
    {
        var erro = ValidarVeiculo(req);
        if (erro is not null) return BadRequest(new { erro });

        var placaLimpa = System.Text.RegularExpressions.Regex.Replace(req.Placa, @"[^A-Za-z0-9]", "").ToUpperInvariant();

        if (await _db.Veiculos.AnyAsync(v => v.Placa == placaLimpa))
            return Conflict(new { erro = "Já existe um veículo cadastrado com essa placa." });

        var veiculo = new Veiculo
        {
            EmpresaId = EmpresaId,
            Placa = placaLimpa,
            Marca = req.Marca.Trim(),
            Modelo = req.Modelo.Trim(),
            AnoFabricacao = req.AnoFabricacao,
            AnoModelo = req.AnoModelo,
            Cor = req.Cor,
            Categoria = req.Categoria,
            ValorDiaria = req.ValorDiaria,
            KmAtual = req.KmAtual,
            Status = req.Status
        };

        _db.Veiculos.Add(veiculo);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(ObterPorId), new { id = veiculo.Id }, ToResponse(veiculo));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, VeiculoRequest req)
    {
        var veiculo = await _db.Veiculos.FirstOrDefaultAsync(v => v.Id == id);
        if (veiculo is null) return NotFound();

        var erro = ValidarVeiculo(req);
        if (erro is not null) return BadRequest(new { erro });

        var placaLimpa = System.Text.RegularExpressions.Regex.Replace(req.Placa, @"[^A-Za-z0-9]", "").ToUpperInvariant();

        if (await _db.Veiculos.AnyAsync(v => v.Placa == placaLimpa && v.Id != id))
            return Conflict(new { erro = "Já existe outro veículo cadastrado com essa placa." });

        veiculo.Placa = placaLimpa;
        veiculo.Marca = req.Marca.Trim();
        veiculo.Modelo = req.Modelo.Trim();
        veiculo.AnoFabricacao = req.AnoFabricacao;
        veiculo.AnoModelo = req.AnoModelo;
        veiculo.Cor = req.Cor;
        veiculo.Categoria = req.Categoria;
        veiculo.ValorDiaria = req.ValorDiaria;
        veiculo.KmAtual = req.KmAtual;
        veiculo.Status = req.Status;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static string? ValidarVeiculo(VeiculoRequest req)
    {
        if (!Validadores.PlacaValida(req.Placa))
            return "Placa inválida. Use o formato ABC1234 ou ABC1D23 (Mercosul).";

        if (string.IsNullOrWhiteSpace(req.Marca))
            return "Informe a marca do veículo.";

        if (string.IsNullOrWhiteSpace(req.Modelo))
            return "Informe o modelo do veículo.";

        if (req.ValorDiaria <= 0)
            return "O valor da diária precisa ser maior que zero.";

        if (req.KmAtual < 0)
            return "A quilometragem não pode ser negativa.";

        var anoAtual = DateTime.UtcNow.Year;
        if (req.AnoFabricacao is < 1950 or > 2100 || req.AnoModelo is < 1950 or > 2100)
            return "Ano de fabricação/modelo inválido.";

        var statusValidos = new[] { "Disponivel", "Locado", "Manutencao", "Inativo" };
        if (!statusValidos.Contains(req.Status))
            return "Status inválido.";

        return null;
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id)
    {
        var veiculo = await _db.Veiculos.Include(v => v.Fotos).FirstOrDefaultAsync(v => v.Id == id);
        if (veiculo is null) return NotFound();

        foreach (var foto in veiculo.Fotos)
        {
            try { await _minio.RemoverArquivoAsync(foto.ObjectName); } catch { /* melhor não travar a exclusão por causa disso */ }
        }

        _db.Veiculos.Remove(veiculo);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Adiciona UMA foto por chamada (o frontend chama isso uma vez pra cada arquivo selecionado)
    [HttpPost("{id:guid}/fotos")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<VeiculoResponse>> AdicionarFoto(Guid id, IFormFile arquivo)
    {
        var veiculo = await _db.Veiculos.Include(v => v.Fotos).FirstOrDefaultAsync(v => v.Id == id);
        if (veiculo is null) return NotFound();

        if (arquivo is null || arquivo.Length == 0)
            return BadRequest(new { erro = "Nenhum arquivo enviado." });

        if (!TiposImagemPermitidos.Contains(arquivo.ContentType))
            return BadRequest(new { erro = "Formato de imagem não suportado. Use JPEG, PNG ou WEBP." });

        await using var stream = arquivo.OpenReadStream();
        var objectName = await _minio.UploadArquivoAsync(stream, arquivo.FileName, arquivo.ContentType);

        var foto = new VeiculoFoto
        {
            EmpresaId = EmpresaId,
            VeiculoId = veiculo.Id,
            Url = _minio.ObterUrlPublica(objectName),
            ObjectName = objectName
        };
        _db.VeiculoFotos.Add(foto);
        await _db.SaveChangesAsync();

        veiculo.Fotos.Add(foto);
        return Ok(ToResponse(veiculo));
    }

    [HttpDelete("{id:guid}/fotos/{fotoId:guid}")]
    public async Task<IActionResult> RemoverFoto(Guid id, Guid fotoId)
    {
        var foto = await _db.VeiculoFotos.FirstOrDefaultAsync(f => f.Id == fotoId && f.VeiculoId == id);
        if (foto is null) return NotFound();

        try { await _minio.RemoverArquivoAsync(foto.ObjectName); } catch { /* segue o jogo mesmo se falhar */ }

        _db.VeiculoFotos.Remove(foto);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
