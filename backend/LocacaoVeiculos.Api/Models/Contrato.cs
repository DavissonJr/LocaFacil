namespace LocacaoVeiculos.Api.Models;

public class Contrato
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmpresaId { get; set; }
    public Empresa? Empresa { get; set; }

    public Guid VeiculoId { get; set; }
    public Veiculo? Veiculo { get; set; }

    public Guid ClienteId { get; set; }
    public Cliente? Cliente { get; set; }

    public Guid? UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public DateTime DataInicio { get; set; }
    public DateTime DataFimPrevista { get; set; }
    public DateTime? DataFimReal { get; set; }

    public int KmInicial { get; set; }
    public int? KmFinal { get; set; }

    public decimal ValorDiaria { get; set; }
    public decimal? ValorTotal { get; set; }

    public string Status { get; set; } = "Ativo"; // Ativo | Finalizado | Cancelado
    public string? Observacoes { get; set; }

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
