import { ConfiguracoesLoja } from '../types';

export const cleanPhone = (phone: string): string => {
  const nums = phone.replace(/\D/g, '');
  if (!nums) return '';
  if (nums.startsWith('55')) return nums;
  return `55${nums}`;
};

export const formatCurrency = (val: number): string => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatDateBR = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return isoDate;
};

export const formatFullDateBR = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
};

export const extrairPrimeiroNome = (nomeCompleto: string): string => {
  if (!nomeCompleto) return 'Cliente';
  return nomeCompleto.trim().split(' ')[0];
};

export const gerarLinkWhatsAppAgradecimento = (
  clienteNome: string,
  clienteWhatsapp: string,
  pedidoId: string,
  itensDescricao: string,
  total: number,
  config: ConfiguracoesLoja,
  dataVencimento?: string,
  totalParcelas?: number
): string => {
  const phone = cleanPhone(clienteWhatsapp);
  const primeiroNome = extrairPrimeiroNome(clienteNome);

  let texto = (config.mensagemAgradecimento || '')
    .replace('{nome}', primeiroNome)
    .replace('{pedidoId}', pedidoId)
    .replace('{itens}', itensDescricao)
    .replace('{valor}', total.toFixed(2).replace('.', ','));

  if (dataVencimento) {
    const infoParcelas = totalParcelas && totalParcelas > 1 ? ` (${totalParcelas}x)` : '';
    texto += `\n\n📅 *Data combinada para pagamento${infoParcelas}:* ${formatDateBR(dataVencimento)}.`;
    texto += `\n🔑 *Chave Pix (${config.tipoChavePix}):* ${config.chavePix}`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
};

export const gerarLinkWhatsAppLembrete = (
  clienteNome: string,
  clienteWhatsapp: string,
  descricaoItens: string,
  valor: number,
  dataVencimento: string,
  isAtrasado: boolean,
  config: ConfiguracoesLoja,
  numeroParcela?: number,
  totalParcelas?: number
): string => {
  const phone = cleanPhone(clienteWhatsapp);
  const primeiroNome = extrairPrimeiroNome(clienteNome);
  const valorFormatado = valor.toFixed(2).replace('.', ',');
  const dataFormatada = formatDateBR(dataVencimento);

  const parcelaTexto = numeroParcela && totalParcelas && totalParcelas > 1 
    ? `(${numeroParcela}/${totalParcelas})` 
    : '';

  let texto = '';
  if (isAtrasado) {
    texto = (config.mensagemCobranca || '')
      .replace('{nome}', primeiroNome)
      .replace('{valor}', valorFormatado)
      .replace('{itens}', descricaoItens)
      .replace('{dataVencimento}', dataFormatada)
      .replace('{parcela}', parcelaTexto)
      .replace('{chavePix}', config.chavePix);
  } else {
    const hoje = new Date().toISOString().split('T')[0];
    const quando = dataVencimento === hoje ? 'hoje' : `no dia ${dataFormatada}`;
    texto = (config.mensagemLembrete || '')
      .replace('{nome}', primeiroNome)
      .replace('{valor}', valorFormatado)
      .replace('{itens}', descricaoItens)
      .replace('{quando}', quando)
      .replace('{parcela}', parcelaTexto)
      .replace('{tipoPix}', config.tipoChavePix)
      .replace('{chavePix}', config.chavePix);
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
};

export const gerarLinkWhatsAppAniversario = (
  clienteNome: string,
  clienteWhatsapp: string,
  config: ConfiguracoesLoja
): string => {
  const phone = cleanPhone(clienteWhatsapp);
  const primeiroNome = extrairPrimeiroNome(clienteNome);

  const texto = (config.mensagemAniversario || '')
    .replace('{nome}', primeiroNome)
    .replace('{cupom}', config.cupomAniversarioPadrao || 'NIVER10');

  return `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
};

export const gerarLinkWhatsAppPersonalizado = (
  clienteNome: string,
  clienteWhatsapp: string,
  mensagemModelo: string,
  config: ConfiguracoesLoja
): string => {
  const phone = cleanPhone(clienteWhatsapp);
  const primeiroNome = extrairPrimeiroNome(clienteNome);

  const texto = mensagemModelo
    .replace('{nome}', primeiroNome)
    .replace('{cupom}', config.cupomAniversarioPadrao || 'NIVER10')
    .replace('{chavePix}', config.chavePix);

  return `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
};


