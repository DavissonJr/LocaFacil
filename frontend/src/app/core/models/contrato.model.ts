export interface Contrato {
  id: string;
  veiculoId: string;
  veiculoDescricao: string;
  clienteId: string;
  clienteNome: string;
  dataInicio: string;
  dataFimPrevista: string;
  dataFimReal?: string;
  kmInicial: number;
  kmFinal?: number;
  valorDiaria: number;
  valorTotal?: number;
  status: 'Ativo' | 'Finalizado' | 'Cancelado';
  observacoes?: string;
}

export interface ContratoRequest {
  veiculoId: string;
  clienteId: string;
  dataInicio: string;
  dataFimPrevista: string;
  kmInicial: number;
  valorDiaria: number;
  observacoes?: string;
}
