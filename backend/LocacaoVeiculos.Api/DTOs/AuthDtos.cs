namespace LocacaoVeiculos.Api.DTOs;

public record RegisterEmpresaRequest(
    string RazaoSocial,
    string? NomeFantasia,
    string CNPJ,
    string EmpresaEmail,
    string? Telefone,
    string AdminNome,
    string AdminEmail,
    string AdminSenha
);

public record LoginRequest(string Email, string Senha);

public record AuthResponse(
    string Token,
    DateTime ExpiraEm,
    Guid UsuarioId,
    string Nome,
    string Role,
    Guid EmpresaId,
    string EmpresaNome
);

public record PerfilResponse(
    Guid Id,
    string Nome,
    string Email,
    string Role,
    Guid EmpresaId,
    string EmpresaNome,
    string EmpresaCNPJ,
    DateTime DataCriacao
);

public record AtualizarPerfilRequest(string Nome, string Email);

public record AlterarSenhaRequest(string SenhaAtual, string NovaSenha);

public record ExcluirEmpresaRequest(string Senha, string ConfirmacaoNomeEmpresa);
