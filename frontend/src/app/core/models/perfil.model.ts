export interface Perfil {
  id: string;
  nome: string;
  email: string;
  role: string;
  empresaId: string;
  empresaNome: string;
  empresaCNPJ: string;
  dataCriacao: string;
}

export interface AtualizarPerfilRequest {
  nome: string;
  email: string;
}

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface ExcluirEmpresaRequest {
  senha: string;
  confirmacaoNomeEmpresa: string;
}
