namespace LocacaoVeiculos.Api.Models;

public class Veiculo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmpresaId { get; set; }
    public Empresa? Empresa { get; set; }

    public string Placa { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public short? AnoFabricacao { get; set; }
    public short? AnoModelo { get; set; }
    public string? Cor { get; set; }
    public string? Categoria { get; set; }
    public decimal ValorDiaria { get; set; }
    public int KmAtual { get; set; }
    public string Status { get; set; } = "Disponivel"; // Disponivel | Locado | Manutencao | Inativo
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public ICollection<VeiculoFoto> Fotos { get; set; } = new List<VeiculoFoto>();
}
