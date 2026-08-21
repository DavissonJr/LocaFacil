/** Utilitários de máscara para documentos brasileiros e placas de veículo. */

export function apenasDigitos(valor: string): string {
  return (valor ?? '').replace(/\D/g, '');
}

export function maskCpf(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCnpj(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function maskDocumento(valor: string, tipo: 'CPF' | 'CNPJ'): string {
  return tipo === 'CNPJ' ? maskCnpj(valor) : maskCpf(valor);
}

export function maskTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return d
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function maskPlaca(valor: string): string {
  return (valor ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}
