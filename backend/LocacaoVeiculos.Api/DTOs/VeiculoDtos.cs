namespace LocacaoVeiculos.Api.DTOs;

public record VeiculoRequest(
    string Placa,
    string Marca,
    string Modelo,
    short? AnoFabricacao,
    short? AnoModelo,
    string? Cor,
    string? Categoria,
    decimal ValorDiaria,
    int KmAtual,
    string Status
);

public record VeiculoResponse(
    Guid Id,
    string Placa,
    string Marca,
    string Modelo,
    short? AnoFabricacao,
    short? AnoModelo,
    string? Cor,
    string? Categoria,
    decimal ValorDiaria,
    int KmAtual,
    string Status,
    string? ImagemUrl
);
