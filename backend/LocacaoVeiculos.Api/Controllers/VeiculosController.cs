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

    public VeiculosController(AppDbContext db, IMinioService minio)
    {
        _db = db;
        _minio = minio;
    }

    private Guid EmpresaId => Guid.Parse(User.FindFirstValue("empresaId")!);

    private static VeiculoResponse ToResponse(Veiculo v) => new(
        v.Id, v.Placa, v.Marca, v.Modelo, v.AnoFabricacao, v.AnoModelo,
        v.Cor, v.Categoria, v.ValorDiaria, v.KmAtual, v.Status, v.ImagemUrl);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VeiculoResponse>>> Listar([FromQuery] string? status)
    {
        var query = _db.Veiculos.AsQueryable(); // já filtrado por tenant via global query filter
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(v => v.Status == status);

        var veiculos = await query.OrderBy(v => v.Marca).ThenBy(v => v.Modelo).ToListAsync();
        return Ok(veiculos.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VeiculoResponse>> ObterPorId(Guid id)
    {
        var veiculo = await _db.Veiculos.FirstOrDefaultAsync(v => v.Id == id);
        if (veiculo is null) return NotFound();
        return Ok(ToResponse(veiculo));
    }

    [HttpPost]
    public async Task<ActionResult<VeiculoResponse>> Criar(VeiculoRequest req)
    {
        var veiculo = new Veiculo
        {
            EmpresaId = EmpresaId,
            Placa = req.Placa.ToUpper(),
            Marca = req.Marca,
            Modelo = req.Modelo,
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

        veiculo.Placa = req.Placa.ToUpper();
        veiculo.Marca = req.Marca;
        veiculo.Modelo = req.Modelo;
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

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remover(Guid id)
    {
        var veiculo = await _db.Veiculos.FirstOrDefaultAsync(v => v.Id == id);
        if (veiculo is null) return NotFound();

        _db.Veiculos.Remove(veiculo);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Upload da foto do veículo -> armazenada no MinIO
    [HttpPost("{id:guid}/imagem")]
    [RequestSizeLimit(10_000_000)]
    public async Task<ActionResult<VeiculoResponse>> UploadImagem(Guid id, IFormFile arquivo)
    {
        var veiculo = await _db.Veiculos.FirstOrDefaultAsync(v => v.Id == id);
        if (veiculo is null) return NotFound();

        if (arquivo is null || arquivo.Length == 0)
            return BadRequest("Nenhum arquivo enviado.");

        var tiposPermitidos = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!tiposPermitidos.Contains(arquivo.ContentType))
            return BadRequest("Formato de imagem não suportado. Use JPEG, PNG ou WEBP.");

        await using var stream = arquivo.OpenReadStream();
        var objectName = await _minio.UploadArquivoAsync(stream, arquivo.FileName, arquivo.ContentType);

        veiculo.ImagemUrl = _minio.ObterUrlPublica(objectName);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(veiculo));
    }
}
