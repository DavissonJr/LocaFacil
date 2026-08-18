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
  imagemUrl?: string;
}

export type VeiculoRequest = Omit<Veiculo, 'id' | 'imagemUrl'>;
