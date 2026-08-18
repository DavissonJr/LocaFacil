namespace LocacaoVeiculos.Api.Models;

public class Cliente
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmpresaId { get; set; }
    public Empresa? Empresa { get; set; }

    public string Nome { get; set; } = string.Empty;
    public string DocumentoTipo { get; set; } = "CPF"; // CPF | CNPJ
    public string Documento { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telefone { get; set; }
    public string? Endereco { get; set; }
    public string? CNH { get; set; }
    public DateTime? ValidadeCNH { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}
