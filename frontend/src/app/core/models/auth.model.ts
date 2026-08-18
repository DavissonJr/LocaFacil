export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterEmpresaRequest {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  empresaEmail: string;
  telefone?: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
}

export interface AuthResponse {
  token: string;
  expiraEm: string;
  usuarioId: string;
  nome: string;
  role: string;
  empresaId: string;
  empresaNome: string;
}
