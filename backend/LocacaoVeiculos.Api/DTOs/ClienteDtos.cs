namespace LocacaoVeiculos.Api.DTOs;

public record ClienteRequest(
    string Nome,
    string DocumentoTipo,
    string Documento,
    string? Email,
    string? Telefone,
    string? Endereco,
    string? CNH,
    DateTime? ValidadeCNH
);

public record ClienteResponse(
    Guid Id,
    string Nome,
    string DocumentoTipo,
    string Documento,
    string? Email,
    string? Telefone,
    string? Endereco,
    string? CNH,
    DateTime? ValidadeCNH,
    bool Ativo
);
