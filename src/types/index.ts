export type FormaPagamento = 'PIX' | 'DINHEIRO' | 'CARTAO' | 'PRAZO';

export type StatusCobranca = 'PENDENTE' | 'PAGO' | 'ATRASADO';

export type GeneroCliente = 'FEMININO' | 'MASCULINO' | 'OUTRO';

export interface Categoria {
  id: string;
  nome: string;
  emoji: string;
}

export interface Marca {
  id: string;
  nome: string;
}

export interface Cliente {
  id: string;
  nome: string;
  referencia?: string; // Ex: "Luana cabeleireira", "Fulano mercado jjr"
  whatsapp: string;
  instagram?: string;
  dataNascimento?: string; // Formato YYYY-MM-DD ou MM-DD
  genero?: GeneroCliente;
  totalComprado?: number;
}

export interface Produto {
  id: string;
  nome: string;
  precoVenda: number;
  precoCusto?: number;
  estoque: number;
  categoriaId?: string;
  categoria: string;
  marcaId?: string;
  marca?: string;
  emoji?: string;
  fotoUrl?: string;
  alertaEstoqueBaixo?: boolean;
  estoqueMinimo?: number; // Notificar quando chegar a esta quantidade ou menos (ex: 1)
  ativo?: boolean; // false se foi arquivado
}

export interface ItemVenda {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteWhatsapp: string;
  data: string; // ISO date
  itens: ItemVenda[];
  total: number;
  formaPagamento: FormaPagamento;
  quantidadeParcelas?: number; // 1, 2, 3
  dataVencimento?: string; // Se a prazo (1ª parcela)
  statusCobranca: StatusCobranca;
}

export interface Cobranca {
  id: string;
  vendaId: string;
  clienteId?: string;
  clienteNome: string;
  clienteWhatsapp: string;
  descricaoItens: string;
  valor: number;
  dataVencimento: string; // YYYY-MM-DD
  status: StatusCobranca;
  dataPagamento?: string;
  formaPagamento?: FormaPagamento;
  numeroParcela?: number; // Ex: 1
  totalParcelas?: number;  // Ex: 2
  itensDetalhados?: ItemVenda[];
}

export interface ConfiguracoesLoja {
  nomeLoja: string;
  chavePix: string;
  tipoChavePix: string; // Celular, CPF, E-mail, Chave Aleatória
  whatsappLoja: string;
  cupomAniversarioPadrao: string;
  mensagemAgradecimento: string;
  mensagemLembrete: string;
  mensagemCobranca: string;
  mensagemAniversario: string;
  mensagemDataComemorativa: string;
}


