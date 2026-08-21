using System.Text.RegularExpressions;

namespace LocacaoVeiculos.Api.Services;

/// <summary>
/// Validações de documentos brasileiros. Confere o dígito verificador de
/// verdade (não só quantidade de caracteres), então "111.111.111-11" é
/// rejeitado mesmo tendo o formato certo.
/// </summary>
public static class Validadores
{
    public static bool CpfValido(string? cpf)
    {
        if (string.IsNullOrWhiteSpace(cpf)) return false;
        var digitos = Regex.Replace(cpf, @"[^\d]", "");
        if (digitos.Length != 11) return false;
        if (new string(digitos[0], 11) == digitos) return false; // 000.000.000-00, 111.111.111-11 etc

        int[] multiplicador1 = { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
        int[] multiplicador2 = { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };

        var temp = digitos[..9];
        var soma = 0;
        for (var i = 0; i < 9; i++) soma += (temp[i] - '0') * multiplicador1[i];
        var resto = soma % 11;
        var digito1 = resto < 2 ? 0 : 11 - resto;

        temp += digito1;
        soma = 0;
        for (var i = 0; i < 10; i++) soma += (temp[i] - '0') * multiplicador2[i];
        resto = soma % 11;
        var digito2 = resto < 2 ? 0 : 11 - resto;

        return digitos.EndsWith($"{digito1}{digito2}");
    }

    public static bool CnpjValido(string? cnpj)
    {
        if (string.IsNullOrWhiteSpace(cnpj)) return false;
        var digitos = Regex.Replace(cnpj, @"[^\d]", "");
        if (digitos.Length != 14) return false;
        if (new string(digitos[0], 14) == digitos) return false;

        int[] multiplicador1 = { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        int[] multiplicador2 = { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };

        var temp = digitos[..12];
        var soma = 0;
        for (var i = 0; i < 12; i++) soma += (temp[i] - '0') * multiplicador1[i];
        var resto = soma % 11;
        var digito1 = resto < 2 ? 0 : 11 - resto;

        temp += digito1;
        soma = 0;
        for (var i = 0; i < 13; i++) soma += (temp[i] - '0') * multiplicador2[i];
        resto = soma % 11;
        var digito2 = resto < 2 ? 0 : 11 - resto;

        return digitos.EndsWith($"{digito1}{digito2}");
    }

    public static bool DocumentoValido(string tipo, string? documento) =>
        tipo.Equals("CNPJ", StringComparison.OrdinalIgnoreCase) ? CnpjValido(documento) : CpfValido(documento);

    public static bool EmailValido(string? email) =>
        !string.IsNullOrWhiteSpace(email) && Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");

    // Placa Mercosul (ABC1D23) ou padrão antigo (ABC1234), com ou sem hífen/espaços
    public static bool PlacaValida(string? placa)
    {
        if (string.IsNullOrWhiteSpace(placa)) return false;
        var limpa = Regex.Replace(placa, @"[^A-Za-z0-9]", "").ToUpperInvariant();
        return Regex.IsMatch(limpa, @"^[A-Z]{3}\d{4}$") || Regex.IsMatch(limpa, @"^[A-Z]{3}\d[A-Z]\d{2}$");
    }
}
