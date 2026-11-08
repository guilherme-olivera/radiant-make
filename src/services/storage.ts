import { Cliente, Produto, Venda, Cobranca, ConfiguracoesLoja, Categoria, Marca } from '../types';

const STORAGE_KEYS = {
  CLIENTES: 'radiant_clientes',
  PRODUTOS: 'radiant_produtos',
  VENDAS: 'radiant_vendas',
  COBRANCAS: 'radiant_cobrancas',
  CONFIG: 'radiant_config',
  CATEGORIAS: 'radiant_categorias',
  MARCAS: 'radiant_marcas'
};

export const INITIAL_CATEGORIAS: Categoria[] = [
  { id: 'cat-1', nome: 'Makes', emoji: '💄' },
  { id: 'cat-2', nome: 'Skincare', emoji: '🧴' },
  { id: 'cat-3', nome: 'Boca & Gloss', emoji: '💋' },
  { id: 'cat-4', nome: 'Olhos & Sobrancelhas', emoji: '👁️' },
  { id: 'cat-5', nome: 'Kits & Presentes', emoji: '🎁' },
  { id: 'cat-6', nome: 'Perfumaria', emoji: '✨' },
  { id: 'cat-7', nome: 'Acessórios & Bolsas', emoji: '👜' }
];

export const INITIAL_MARCAS: Marca[] = [
  { id: 'm-1', nome: 'Ruby Rose' },
  { id: 'm-2', nome: 'Bruna Tavares' },
  { id: 'm-3', nome: 'Boca Rosa' },
  { id: 'm-4', nome: 'Franciny Ehlke' },
  { id: 'm-5', nome: 'Melu' },
  { id: 'm-6', nome: 'Eudora' },
  { id: 'm-7', nome: 'Natura' },
  { id: 'm-8', nome: 'O Boticário' },
  { id: 'm-9', nome: 'Radiant Própria' }
];

export const INITIAL_CONFIG: ConfiguracoesLoja = {
  nomeLoja: 'Radiant Make',
  chavePix: '19999999999',
  tipoChavePix: 'Celular',
  whatsappLoja: '19999999999',
  cupomAniversarioPadrao: 'NIVER10',
  mensagemAgradecimento: 'Oi, {nome}! ✨ Passando para agradecer pela sua compra na Radiant Make! Seu pedido #{pedidoId} ({itens}) ficou em R$ {valor}. Qualquer dúvida estou por aqui! 💖',
  mensagemLembrete: 'Oi, {nome}! Tudo bem? 🌸 Passando com carinho para lembrar que sua parcela {parcela} de R$ {valor} da Radiant Make referente a ({itens}) vence {quando}. Chave Pix ({tipoPix}): {chavePix}. Quando fizer, só me mandar o comprovante por aqui! Obrigada! ✨',
  mensagemCobranca: 'Oi, {nome}! Tudo bem? 🌸 Passando para conferir se deu tudo certo com você. Constou aqui que a sua parcela {parcela} de R$ {valor} referente a ({itens}) venceu dia {dataVencimento}. Se já fez o Pix, me manda o comprovante por favor para eu dar baixa? Chave Pix: {chavePix}. Muito obrigada! 💖',
  mensagemAniversario: 'Parabéns pelo seu dia, {nome}! 🎂✨ Desejo muitas felicidades, saúde e realizações! Para comemorar, preparei um mimo especial: use o cupom *{cupom}* e ganhe 10% de desconto em qualquer produtinho este mês! 💖 Aproveite o seu dia!',
  mensagemDataComemorativa: 'Oi, {nome}! 🌸 Passando para desejar uma semana iluminada e avisar que chegaram novidades incríveis de makes e autocuidado na Radiant Make! ✨ Se quiser ver o catálogo atualizado, é só me responder aqui! 💖'
};

export const INITIAL_CLIENTES: Cliente[] = [
  { id: '1', nome: 'Camila Silva', referencia: 'Luana cabeleireira / Salão Bella', whatsapp: '19987654321', instagram: 'camilasilva.make', dataNascimento: '1998-11-12', genero: 'FEMININO' },
  { id: '2', nome: 'Beatriz Oliveira', referencia: 'Prima da Mari / Mercado JJR', whatsapp: '19981234567', instagram: 'bia_oliveira', dataNascimento: '1995-11-08', genero: 'FEMININO' },
  { id: '3', nome: 'Carla Menezes', referencia: 'Professora da academia', whatsapp: '19976543210', instagram: 'carla.m', dataNascimento: '1990-05-20', genero: 'FEMININO' },
  { id: '4', nome: 'Ana Paula Diniz', referencia: 'Vizinha do bloco B', whatsapp: '19992345678', instagram: 'anapaula.diniz', dataNascimento: '1993-12-04', genero: 'FEMININO' },
  { id: '5', nome: 'Juliana Santos', referencia: 'Amiga do trabalho', whatsapp: '19988776655', instagram: 'ju.santos', dataNascimento: '1996-08-15', genero: 'FEMININO' },
  { id: '6', nome: 'Lucas Miranda', referencia: 'Namorado da Bia / Presentes', whatsapp: '19991122334', dataNascimento: '1992-11-25', genero: 'MASCULINO' }
];

export const INITIAL_PRODUTOS: Produto[] = [
  { id: '1', nome: 'Esfoliante Facial Rosa Mosqueta', precoVenda: 28.00, precoCusto: 14.00, estoque: 8, categoriaId: 'cat-2', categoria: 'Skincare', marca: 'Ruby Rose', emoji: '🧴', alertaEstoqueBaixo: true, estoqueMinimo: 2 },
  { id: '2', nome: 'Gloss Labial Love Volume', precoVenda: 22.00, precoCusto: 10.00, estoque: 12, categoriaId: 'cat-3', categoria: 'Boca & Gloss', marca: 'Melu', emoji: '💋', alertaEstoqueBaixo: true, estoqueMinimo: 3 },
  { id: '3', nome: 'Kit Presente Men Gel + Pomada', precoVenda: 55.00, precoCusto: 28.00, estoque: 3, categoriaId: 'cat-5', categoria: 'Kits & Presentes', marca: 'Eudora', emoji: '🎁', alertaEstoqueBaixo: true, estoqueMinimo: 1 },
  { id: '4', nome: 'Perfume Masculino Selvagem 40', precoVenda: 95.00, precoCusto: 48.00, estoque: 5, categoriaId: 'cat-6', categoria: 'Perfumaria', marca: 'Natura', emoji: '✨', alertaEstoqueBaixo: true, estoqueMinimo: 2 },
  { id: '5', nome: 'Bolsa Tiracolo Marrom Croco', precoVenda: 130.00, precoCusto: 75.00, estoque: 1, categoriaId: 'cat-7', categoria: 'Acessórios & Bolsas', marca: 'Radiant Própria', emoji: '👜', alertaEstoqueBaixo: true, estoqueMinimo: 1 },
  { id: '6', nome: 'Kit Skincare La Belle Mosquet', precoVenda: 65.00, precoCusto: 32.00, estoque: 4, categoriaId: 'cat-2', categoria: 'Skincare', marca: 'Bruna Tavares', emoji: '🧴', alertaEstoqueBaixo: true, estoqueMinimo: 2 },
  { id: '7', nome: 'Base Líquida Matte Velvet', precoVenda: 45.00, precoCusto: 24.00, estoque: 1, categoriaId: 'cat-1', categoria: 'Makes', marca: 'Boca Rosa', emoji: '💄', alertaEstoqueBaixo: true, estoqueMinimo: 2 },
  { id: '8', nome: 'Paleta Sombras Chocofun', precoVenda: 58.00, precoCusto: 29.00, estoque: 7, categoriaId: 'cat-4', categoria: 'Olhos & Sobrancelhas', marca: 'Franciny Ehlke', emoji: '👁️', alertaEstoqueBaixo: true, estoqueMinimo: 2 }
];

export const INITIAL_COBRANCAS: Cobranca[] = [
  {
    id: 'cob-1',
    vendaId: 'v-101',
    clienteNome: 'Carla Menezes',
    clienteWhatsapp: '19976543210',
    descricaoItens: 'Bolsa Tiracolo Marrom Croco',
    valor: 65.00,
    dataVencimento: '2026-11-04',
    status: 'ATRASADO',
    formaPagamento: 'PRAZO',
    numeroParcela: 1,
    totalParcelas: 2,
    itensDetalhados: [
      { produtoId: '5', nome: 'Bolsa Tiracolo Marrom Croco', quantidade: 1, precoUnitario: 130.00, subtotal: 130.00 }
    ]
  },
  {
    id: 'cob-1-p2',
    vendaId: 'v-101',
    clienteNome: 'Carla Menezes',
    clienteWhatsapp: '19976543210',
    descricaoItens: 'Bolsa Tiracolo Marrom Croco',
    valor: 65.00,
    dataVencimento: '2026-12-04',
    status: 'PENDENTE',
    formaPagamento: 'PRAZO',
    numeroParcela: 2,
    totalParcelas: 2,
    itensDetalhados: [
      { produtoId: '5', nome: 'Bolsa Tiracolo Marrom Croco', quantidade: 1, precoUnitario: 130.00, subtotal: 130.00 }
    ]
  },
  {
    id: 'cob-2',
    vendaId: 'v-102',
    clienteNome: 'Camila Silva',
    clienteWhatsapp: '19987654321',
    descricaoItens: 'Kit Presente Men + Gloss',
    valor: 77.00,
    dataVencimento: new Date().toISOString().split('T')[0], // Hoje
    status: 'PENDENTE',
    formaPagamento: 'PRAZO',
    numeroParcela: 1,
    totalParcelas: 1,
    itensDetalhados: [
      { produtoId: '3', nome: 'Kit Presente Men Gel + Pomada', quantidade: 1, precoUnitario: 55.00, subtotal: 55.00 },
      { produtoId: '2', nome: 'Gloss Labial Love Volume', quantidade: 1, precoUnitario: 22.00, subtotal: 22.00 }
    ]
  },
  {
    id: 'cob-3',
    vendaId: 'v-103',
    clienteNome: 'Beatriz Oliveira',
    clienteWhatsapp: '19981234567',
    descricaoItens: 'Esfoliante Facial Rosa Mosqueta',
    valor: 28.00,
    dataVencimento: new Date().toISOString().split('T')[0], // Hoje
    status: 'PENDENTE',
    formaPagamento: 'PRAZO',
    numeroParcela: 1,
    totalParcelas: 1,
    itensDetalhados: [
      { produtoId: '1', nome: 'Esfoliante Facial Rosa Mosqueta', quantidade: 1, precoUnitario: 28.00, subtotal: 28.00 }
    ]
  },
  {
    id: 'cob-4',
    vendaId: 'v-104',
    clienteNome: 'Ana Paula Diniz',
    clienteWhatsapp: '19992345678',
    descricaoItens: 'Kit Skincare La Belle',
    valor: 65.00,
    dataVencimento: '2026-11-20',
    status: 'PENDENTE',
    formaPagamento: 'PRAZO',
    numeroParcela: 1,
    totalParcelas: 1,
    itensDetalhados: [
      { produtoId: '6', nome: 'Kit Skincare La Belle Mosquet', quantidade: 1, precoUnitario: 65.00, subtotal: 65.00 }
    ]
  }
];

export const storage = {
  getConfig: (): ConfiguracoesLoja => {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!data) return INITIAL_CONFIG;
    try {
      return { ...INITIAL_CONFIG, ...JSON.parse(data) };
    } catch {
      return INITIAL_CONFIG;
    }
  },
  saveConfig: (config: ConfiguracoesLoja) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  getCategorias: (): Categoria[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIAS);
    return data ? JSON.parse(data) : INITIAL_CATEGORIAS;
  },
  saveCategorias: (categorias: Categoria[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(categorias));
  },

  getMarcas: (): Marca[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MARCAS);
    return data ? JSON.parse(data) : INITIAL_MARCAS;
  },
  saveMarcas: (marcas: Marca[]) => {
    localStorage.setItem(STORAGE_KEYS.MARCAS, JSON.stringify(marcas));
  },

  getClientes: (): Cliente[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTES);
    return data ? JSON.parse(data) : INITIAL_CLIENTES;
  },
  saveClientes: (clientes: Cliente[]) => {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
  },

  getProdutos: (): Produto[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    return data ? JSON.parse(data) : INITIAL_PRODUTOS;
  },
  saveProdutos: (produtos: Produto[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(produtos));
  },
  atualizarProduto: (produtoAtualizado: Produto) => {
    const produtos = storage.getProdutos();
    const index = produtos.findIndex(p => p.id === produtoAtualizado.id);
    if (index !== -1) {
      produtos[index] = produtoAtualizado;
      storage.saveProdutos(produtos);
    }
  },
  abastecerProduto: (
    id: string,
    quantidadeAdicionada: number,
    novoCustoUnitario: number,
    novoPrecoVenda?: number
  ) => {
    const produtos = storage.getProdutos();
    const target = produtos.find(p => p.id === id);
    if (!target) return;

    const qtdAtual = target.estoque || 0;
    const custoAtual = target.precoCusto || 0;

    // Cálculo do Custo Médio Ponderado
    let novoCustoMedio = novoCustoUnitario;
    if (qtdAtual > 0) {
      const valorEstoqueAtual = qtdAtual * custoAtual;
      const valorNovoLote = quantidadeAdicionada * novoCustoUnitario;
      const novoEstoqueTotal = qtdAtual + quantidadeAdicionada;
      novoCustoMedio = Number(((valorEstoqueAtual + valorNovoLote) / novoEstoqueTotal).toFixed(2));
    }

    target.estoque = qtdAtual + quantidadeAdicionada;
    target.precoCusto = novoCustoMedio;
    if (novoPrecoVenda && novoPrecoVenda > 0) {
      target.precoVenda = novoPrecoVenda;
    }

    storage.saveProdutos(produtos);
  },
  excluirProduto: (id: string) => {
    const produtos = storage.getProdutos().filter(p => p.id !== id);
    storage.saveProdutos(produtos);
  },
  alternarStatusProduto: (id: string) => {
    const produtos = storage.getProdutos();
    const target = produtos.find(p => p.id === id);
    if (target) {
      target.ativo = target.ativo === false ? true : false;
      storage.saveProdutos(produtos);
    }
  },

  getVendas: (): Venda[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VENDAS);
    return data ? JSON.parse(data) : [];
  },
  saveVendas: (vendas: Venda[]) => {
    localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendas));
  },
  saveVenda: (venda: Venda) => {
    const vendas = storage.getVendas();
    vendas.unshift(venda);
    localStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendas));

    // Abate estoque dos produtos
    const produtos = storage.getProdutos();
    venda.itens.forEach(item => {
      const p = produtos.find(prod => prod.id === item.produtoId);
      if (p) {
        p.estoque = Math.max(0, p.estoque - item.quantidade);
      }
    });
    storage.saveProdutos(produtos);

    // Se foi a prazo, gera parcelas em cobranças
    if (venda.formaPagamento === 'PRAZO' && venda.dataVencimento) {
      const qtdParcelas = venda.quantidadeParcelas || 1;
      const valorParcela = Number((venda.total / qtdParcelas).toFixed(2));
      const cobrancas = storage.getCobrancas();

      const [ano, mes, dia] = venda.dataVencimento.split('-').map(Number);

      for (let i = 1; i <= qtdParcelas; i++) {
        // Gera data para parcela i
        const dataParcela = new Date(ano, (mes - 1) + (i - 1), dia);
        const isoParcela = dataParcela.toISOString().split('T')[0];

        const cobranca: Cobranca = {
          id: `cob-${venda.id}-p${i}`,
          vendaId: venda.id,
          clienteId: venda.clienteId,
          clienteNome: venda.clienteNome,
          clienteWhatsapp: venda.clienteWhatsapp,
          descricaoItens: venda.itens.map(it => `${it.quantidade}x ${it.nome}`).join(', '),
          valor: valorParcela,
          dataVencimento: isoParcela,
          status: 'PENDENTE',
          formaPagamento: 'PRAZO',
          numeroParcela: i,
          totalParcelas: qtdParcelas,
          itensDetalhados: venda.itens
        };
        cobrancas.unshift(cobranca);
      }

      storage.saveCobrancas(cobrancas);
    }
  },

  getCobrancas: (): Cobranca[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COBRANCAS);
    return data ? JSON.parse(data) : INITIAL_COBRANCAS;
  },
  saveCobrancas: (cobrancas: Cobranca[]) => {
    localStorage.setItem(STORAGE_KEYS.COBRANCAS, JSON.stringify(cobrancas));
  },
  darBaixaCobranca: (id: string) => {
    const cobrancas = storage.getCobrancas();
    const target = cobrancas.find(c => c.id === id);
    if (target) {
      target.status = 'PAGO';
      target.dataPagamento = new Date().toISOString();
      storage.saveCobrancas(cobrancas);
    }
  },
  atualizarDataVencimentoCobranca: (id: string, novaData: string) => {
    const cobrancas = storage.getCobrancas();
    const target = cobrancas.find(c => c.id === id);
    if (target) {
      target.dataVencimento = novaData;
      // Atualiza status se não estava pago
      const hoje = new Date().toISOString().split('T')[0];
      if (target.status !== 'PAGO') {
        target.status = novaData < hoje ? 'ATRASADO' : 'PENDENTE';
      }
      storage.saveCobrancas(cobrancas);
    }
  }
};


