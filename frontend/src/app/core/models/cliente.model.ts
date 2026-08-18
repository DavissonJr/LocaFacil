export interface Cliente {
  id: string;
  nome: string;
  documentoTipo: 'CPF' | 'CNPJ';
  documento: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cnh?: string;
  validadeCNH?: string;
  ativo: boolean;
}

export type ClienteRequest = Omit<Cliente, 'id' | 'ativo'>;
