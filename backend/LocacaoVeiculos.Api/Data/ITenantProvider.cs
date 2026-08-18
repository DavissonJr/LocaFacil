namespace LocacaoVeiculos.Api.Data;

/// <summary>
/// Resolve o EmpresaId (tenant) do usuário autenticado a partir do JWT.
/// Usado pelo DbContext para filtrar automaticamente todas as consultas.
/// </summary>
public interface ITenantProvider
{
    Guid? EmpresaId { get; }
}

public class TenantProvider : ITenantProvider
{
    public Guid? EmpresaId { get; private set; }

    public TenantProvider(IHttpContextAccessor accessor)
    {
        var claim = accessor.HttpContext?.User?.FindFirst("empresaId")?.Value;
        if (Guid.TryParse(claim, out var id))
        {
            EmpresaId = id;
        }
    }
}
