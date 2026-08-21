namespace LocacaoVeiculos.Api.Models;

public class VeiculoFoto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmpresaId { get; set; }
    public Guid VeiculoId { get; set; }
    public Veiculo? Veiculo { get; set; }

    public string Url { get; set; } = string.Empty;
    public string ObjectName { get; set; } = string.Empty; // nome do objeto no MinIO, usado pra poder deletar
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
