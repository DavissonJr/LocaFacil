using System.Security.Claims;
using LocacaoVeiculos.Api.Data;
using LocacaoVeiculos.Api.DTOs;
using LocacaoVeiculos.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocacaoVeiculos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ContratosController : ControllerBase
{
    private readonly AppDbContext _db;
    public ContratosController(AppDbContext db) => _db = db;

    private Guid EmpresaId => Guid.Parse(User.FindFirstValue("empresaId")!);
    private Guid UsuarioId => Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);

    private static ContratoResponse ToResponse(Contrato c) => new(
        c.Id, c.VeiculoId, $"{c.Veiculo?.Marca} {c.Veiculo?.Modelo} - {c.Veiculo?.Placa}",
        c.ClienteId, c.Cliente?.Nome ?? "",
        c.DataInicio, c.DataFimPrevista, c.DataFimReal,
        c.KmInicial, c.KmFinal, c.ValorDiaria, c.ValorTotal, c.Status, c.Observacoes);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContratoResponse>>> Listar([FromQuery] string? status)
    {
        var query = _db.Contratos.Include(c => c.Veiculo).Include(c => c.Cliente).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(c => c.Status == status);

        var contratos = await query.OrderByDescending(c => c.DataCriacao).ToListAsync();
        return Ok(contratos.Select(ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContratoResponse>> ObterPorId(Guid id)
    {
        var contrato = await _db.Contratos.Include(c => c.Veiculo).Include(c => c.Cliente)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (contrato is null) return NotFound();
        return Ok(ToResponse(contrato));
    }

    [HttpPost]
    public async Task<ActionResult<ContratoResponse>> Criar(ContratoRequest req)
    {
        var veiculo = await _db.Veiculos.FirstOrDefaultAsync(v => v.Id == req.VeiculoId);
        if (veiculo is null) return BadRequest("Veículo não encontrado.");
        if (veiculo.Status != "Disponivel") return BadRequest("Veículo não está disponível para locação.");

        var cliente = await _db.Clientes.FirstOrDefaultAsync(c => c.Id == req.ClienteId);
        if (cliente is null) return BadRequest("Cliente não encontrado.");

        var contrato = new Contrato
        {
            EmpresaId = EmpresaId,
            VeiculoId = req.VeiculoId,
            ClienteId = req.ClienteId,
            UsuarioId = UsuarioId,
            DataInicio = req.DataInicio,
            DataFimPrevista = req.DataFimPrevista,
            KmInicial = req.KmInicial,
            ValorDiaria = req.ValorDiaria,
            Observacoes = req.Observacoes,
            Status = "Ativo"
        };

        veiculo.Status = "Locado";

        _db.Contratos.Add(contrato);
        await _db.SaveChangesAsync();

        contrato.Veiculo = veiculo;
        contrato.Cliente = cliente;
        return CreatedAtAction(nameof(ObterPorId), new { id = contrato.Id }, ToResponse(contrato));
    }

    // Finaliza a locação: registra km final, calcula valor total e libera o veículo
    [HttpPost("{id:guid}/finalizar")]
    public async Task<ActionResult<ContratoResponse>> Finalizar(Guid id, FinalizarContratoRequest req)
    {
        var contrato = await _db.Contratos.Include(c => c.Veiculo).Include(c => c.Cliente)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (contrato is null) return NotFound();
        if (contrato.Status != "Ativo") return BadRequest("Este contrato já foi finalizado ou cancelado.");
        if (req.KmFinal < contrato.KmInicial) return BadRequest("Km final não pode ser menor que o km inicial.");

        contrato.DataFimReal = DateTime.UtcNow;
        contrato.KmFinal = req.KmFinal;
        contrato.Status = "Finalizado";

        var dias = Math.Max(1, (int)Math.Ceiling((contrato.DataFimReal.Value - contrato.DataInicio).TotalDays));
        contrato.ValorTotal = dias * contrato.ValorDiaria;

        if (contrato.Veiculo is not null)
        {
            contrato.Veiculo.Status = "Disponivel";
            contrato.Veiculo.KmAtual = req.KmFinal;
        }

        await _db.SaveChangesAsync();
        return Ok(ToResponse(contrato));
    }

    [HttpPost("{id:guid}/cancelar")]
    public async Task<IActionResult> Cancelar(Guid id)
    {
        var contrato = await _db.Contratos.Include(c => c.Veiculo).FirstOrDefaultAsync(c => c.Id == id);
        if (contrato is null) return NotFound();
        if (contrato.Status != "Ativo") return BadRequest("Apenas contratos ativos podem ser cancelados.");

        contrato.Status = "Cancelado";
        if (contrato.Veiculo is not null) contrato.Veiculo.Status = "Disponivel";

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
