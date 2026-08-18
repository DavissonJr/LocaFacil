using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LocacaoVeiculos.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace LocacaoVeiculos.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string token, DateTime expiraEm) GerarToken(Usuario usuario)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiraEm = DateTime.UtcNow.AddMinutes(double.Parse(jwtSection["ExpiresInMinutes"]!));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.Email),
            new("nome", usuario.Nome),
            new("role", usuario.Role),
            new("empresaId", usuario.EmpresaId.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: expiraEm,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expiraEm);
    }
}
