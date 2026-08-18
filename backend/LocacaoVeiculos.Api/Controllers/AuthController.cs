using LocacaoVeiculos.Api.Data;
using LocacaoVeiculos.Api.DTOs;
using LocacaoVeiculos.Api.Models;
using LocacaoVeiculos.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LocacaoVeiculos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    // Cria a empresa (tenant) + usuário administrador inicial
    [HttpPost("registrar-empresa")]
    public async Task<ActionResult<AuthResponse>> RegistrarEmpresa(RegisterEmpresaRequest req)
    {
        if (await _db.Empresas.AnyAsync(e => e.CNPJ == req.CNPJ))
            return Conflict("Já existe uma empresa cadastrada com esse CNPJ.");

        var empresa = new Empresa
        {
            RazaoSocial = req.RazaoSocial,
            NomeFantasia = req.NomeFantasia,
            CNPJ = req.CNPJ,
            Email = req.EmpresaEmail,
            Telefone = req.Telefone
        };
        _db.Empresas.Add(empresa);

        var admin = new Usuario
        {
            EmpresaId = empresa.Id,
            Nome = req.AdminNome,
            Email = req.AdminEmail,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(req.AdminSenha),
            Role = "Admin"
        };
        _db.Usuarios.Add(admin);

        await _db.SaveChangesAsync();

        var (token, expiraEm) = _tokenService.GerarToken(admin);
        return Ok(new AuthResponse(token, expiraEm, admin.Id, admin.Nome, admin.Role, empresa.Id, empresa.NomeFantasia ?? empresa.RazaoSocial));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var usuario = await _db.Usuarios
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Email == req.Email && u.Ativo);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(req.Senha, usuario.SenhaHash))
            return Unauthorized("E-mail ou senha inválidos.");

        var (token, expiraEm) = _tokenService.GerarToken(usuario);
        return Ok(new AuthResponse(token, expiraEm, usuario.Id, usuario.Nome, usuario.Role, usuario.EmpresaId,
            usuario.Empresa?.NomeFantasia ?? usuario.Empresa?.RazaoSocial ?? ""));
    }
}
