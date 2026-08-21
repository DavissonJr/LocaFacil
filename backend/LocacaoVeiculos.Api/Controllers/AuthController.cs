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
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly IMinioService _minio;

    public AuthController(AppDbContext db, ITokenService tokenService, IMinioService minio)
    {
        _db = db;
        _tokenService = tokenService;
        _minio = minio;
    }

    private Guid UsuarioId => Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);

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

    [HttpGet("perfil")]
    [Authorize]
    public async Task<ActionResult<PerfilResponse>> ObterPerfil()
    {
        var usuario = await _db.Usuarios.Include(u => u.Empresa).FirstOrDefaultAsync(u => u.Id == UsuarioId);
        if (usuario is null || usuario.Empresa is null) return NotFound();

        return Ok(new PerfilResponse(
            usuario.Id, usuario.Nome, usuario.Email, usuario.Role,
            usuario.Empresa.Id, usuario.Empresa.NomeFantasia ?? usuario.Empresa.RazaoSocial, usuario.Empresa.CNPJ,
            usuario.DataCriacao));
    }

    [HttpPut("perfil")]
    [Authorize]
    public async Task<ActionResult<PerfilResponse>> AtualizarPerfil(AtualizarPerfilRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Nome))
            return BadRequest(new { erro = "Informe seu nome." });

        if (!Validadores.EmailValido(req.Email))
            return BadRequest(new { erro = "E-mail inválido." });

        var usuario = await _db.Usuarios.Include(u => u.Empresa).FirstOrDefaultAsync(u => u.Id == UsuarioId);
        if (usuario is null || usuario.Empresa is null) return NotFound();

        var emailNormalizado = req.Email.Trim().ToLowerInvariant();
        if (await _db.Usuarios.AnyAsync(u => u.Email == emailNormalizado && u.Id != usuario.Id))
            return Conflict(new { erro = "Já existe um usuário com esse e-mail." });

        usuario.Nome = req.Nome.Trim();
        usuario.Email = emailNormalizado;
        await _db.SaveChangesAsync();

        return Ok(new PerfilResponse(
            usuario.Id, usuario.Nome, usuario.Email, usuario.Role,
            usuario.Empresa.Id, usuario.Empresa.NomeFantasia ?? usuario.Empresa.RazaoSocial, usuario.Empresa.CNPJ,
            usuario.DataCriacao));
    }

    [HttpPut("senha")]
    [Authorize]
    public async Task<IActionResult> AlterarSenha(AlterarSenhaRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.NovaSenha) || req.NovaSenha.Length < 6)
            return BadRequest(new { erro = "A nova senha precisa ter pelo menos 6 caracteres." });

        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Id == UsuarioId);
        if (usuario is null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(req.SenhaAtual, usuario.SenhaHash))
            return BadRequest(new { erro = "Senha atual incorreta." });

        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(req.NovaSenha);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Exclui a empresa inteira (tenant) e tudo relacionado a ela - só o Admin pode.
    // É uma ação destrutiva e definitiva, por isso exige a senha e o nome da empresa como confirmação.
    [HttpDelete("empresa")]
    [Authorize]
    public async Task<IActionResult> ExcluirEmpresa(ExcluirEmpresaRequest req)
    {
        var usuario = await _db.Usuarios.Include(u => u.Empresa).FirstOrDefaultAsync(u => u.Id == UsuarioId);
        if (usuario is null || usuario.Empresa is null) return NotFound();

        if (usuario.Role != "Admin")
            return StatusCode(403, new { erro = "Apenas o administrador da empresa pode excluir a conta." });

        if (!BCrypt.Net.BCrypt.Verify(req.Senha, usuario.SenhaHash))
            return BadRequest(new { erro = "Senha incorreta." });

        var nomeEsperado = usuario.Empresa.NomeFantasia ?? usuario.Empresa.RazaoSocial;
        if (!string.Equals(req.ConfirmacaoNomeEmpresa?.Trim(), nomeEsperado, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { erro = $"Digite exatamente \"{nomeEsperado}\" para confirmar a exclusão." });

        // Limpa os arquivos no MinIO antes de apagar o registro (best-effort - se falhar,
        // não impede a exclusão da conta, só deixa um arquivo órfão no bucket).
        var fotos = await _db.VeiculoFotos.Where(f => f.EmpresaId == usuario.EmpresaId).ToListAsync();
        foreach (var foto in fotos)
        {
            try { await _minio.RemoverArquivoAsync(foto.ObjectName); } catch { }
        }
        var documentos = await _db.Clientes
            .Where(c => c.EmpresaId == usuario.EmpresaId && c.DocumentoImagemObjectName != null)
            .Select(c => c.DocumentoImagemObjectName!)
            .ToListAsync();
        foreach (var objectName in documentos)
        {
            try { await _minio.RemoverArquivoAsync(objectName); } catch { }
        }

        // Apaga a empresa - o cascade delete configurado no DbContext cuida de
        // Usuarios, Veiculos, VeiculoFotos, Clientes e Contratos automaticamente.
        _db.Empresas.Remove(usuario.Empresa);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
