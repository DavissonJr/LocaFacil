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
        if (string.IsNullOrWhiteSpace(req.RazaoSocial))
            return BadRequest(new { erro = "Informe a razão social da empresa." });

        if (!Validadores.CnpjValido(req.CNPJ))
            return BadRequest(new { erro = "CNPJ inválido. Confira os números digitados." });

        if (!Validadores.EmailValido(req.EmpresaEmail))
            return BadRequest(new { erro = "E-mail da empresa inválido." });

        if (string.IsNullOrWhiteSpace(req.AdminNome))
            return BadRequest(new { erro = "Informe seu nome." });

        if (!Validadores.EmailValido(req.AdminEmail))
            return BadRequest(new { erro = "E-mail de login inválido." });

        if (string.IsNullOrWhiteSpace(req.AdminSenha) || req.AdminSenha.Length < 6)
            return BadRequest(new { erro = "A senha precisa ter pelo menos 6 caracteres." });

        if (await _db.Empresas.AnyAsync(e => e.CNPJ == req.CNPJ))
            return Conflict(new { erro = "Já existe uma empresa cadastrada com esse CNPJ." });

        if (await _db.Usuarios.AnyAsync(u => u.Email == req.AdminEmail))
            return Conflict(new { erro = "Já existe um usuário cadastrado com esse e-mail." });

        var empresa = new Empresa
        {
            RazaoSocial = req.RazaoSocial.Trim(),
            NomeFantasia = req.NomeFantasia?.Trim(),
            CNPJ = req.CNPJ,
            Email = req.EmpresaEmail.Trim(),
            Telefone = req.Telefone
        };
        _db.Empresas.Add(empresa);

        var admin = new Usuario
        {
            EmpresaId = empresa.Id,
            Nome = req.AdminNome.Trim(),
            Email = req.AdminEmail.Trim().ToLowerInvariant(),
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
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Senha))
            return BadRequest(new { erro = "Informe e-mail e senha." });

        var usuario = await _db.Usuarios
            .Include(u => u.Empresa)
            .FirstOrDefaultAsync(u => u.Email == req.Email.Trim().ToLower() && u.Ativo);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(req.Senha, usuario.SenhaHash))
            return Unauthorized(new { erro = "E-mail ou senha inválidos." });

        var (token, expiraEm) = _tokenService.GerarToken(usuario);
        return Ok(new AuthResponse(token, expiraEm, usuario.Id, usuario.Nome, usuario.Role, usuario.EmpresaId,
            usuario.Empresa?.NomeFantasia ?? usuario.Empresa?.RazaoSocial ?? ""));
    }
}
