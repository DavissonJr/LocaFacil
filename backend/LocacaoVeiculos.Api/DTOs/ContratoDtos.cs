namespace LocacaoVeiculos.Api.DTOs;

public record ContratoRequest(
    Guid VeiculoId,
    Guid ClienteId,
    DateTime DataInicio,
    DateTime DataFimPrevista,
    int KmInicial,
    decimal ValorDiaria,
    string? Observacoes
);

public record FinalizarContratoRequest(int KmFinal);

public record ContratoResponse(
    Guid Id,
    Guid VeiculoId,
    string VeiculoDescricao,
    Guid ClienteId,
    string ClienteNome,
    DateTime DataInicio,
    DateTime DataFimPrevista,
    DateTime? DataFimReal,
    int KmInicial,
    int? KmFinal,
    decimal ValorDiaria,
    decimal? ValorTotal,
    string Status,
    string? Observacoes
);
