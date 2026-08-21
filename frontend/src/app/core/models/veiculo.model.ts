export interface VeiculoFoto {
  id: string;
  url: string;
}

export interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao?: number;
  anoModelo?: number;
  cor?: string;
  categoria?: string;
  valorDiaria: number;
  kmAtual: number;
  status: 'Disponivel' | 'Locado' | 'Manutencao' | 'Inativo';
  fotos: VeiculoFoto[];
}

export type VeiculoRequest = Omit<Veiculo, 'id' | 'fotos'>;
