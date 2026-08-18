using LocacaoVeiculos.Api.Models;

namespace LocacaoVeiculos.Api.Services;

public interface ITokenService
{
    (string token, DateTime expiraEm) GerarToken(Usuario usuario);
}
