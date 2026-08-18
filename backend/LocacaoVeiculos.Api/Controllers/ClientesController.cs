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
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _db;
    public ClientesController(AppDbContext db) => _db = db;

    private Guid EmpresaId => Guid.Parse(User.FindFirstValue("empresaId")!);

    private static ClienteResponse ToResponse(Cliente c) => new(
        c.Id, c.Nome, c.DocumentoTipo, c.Documento, c.Email, c.Telefone, c.Endereco, c.CNH, c.ValidadeCNH, c.Ativo);

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
}
