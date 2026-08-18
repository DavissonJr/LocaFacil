namespace LocacaoVeiculos.Api.Models;

public class Empresa
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RazaoSocial { get; set; } = string.Empty;
    public string? NomeFantasia { get; set; }
    public string CNPJ { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    public ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
    public ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
    public ICollection<Contrato> Contratos { get; set; } = new List<Contrato>();
}
