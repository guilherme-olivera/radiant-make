const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://filsokpyqndkbskwbscn.supabase.co',
  'sb_publishable_aAJrZAouL2qe9d_Mm5ylBw_kd5B1SrK'
);

const INITIAL_CLIENTES = [
  { id: '1', nome: 'Camila Silva', referencia: 'Luana cabeleireira / Salão Bella', whatsapp: '19987654321', instagram: 'camilasilva.make', data_nascimento: '1998-11-12', genero: 'FEMININO' },
  { id: '2', nome: 'Beatriz Oliveira', referencia: 'Prima da Mari / Mercado JJR', whatsapp: '19981234567', instagram: 'bia_oliveira', data_nascimento: '1995-11-08', genero: 'FEMININO' },
  { id: '3', nome: 'Carla Menezes', referencia: 'Professora da academia', whatsapp: '19976543210', instagram: 'carla.m', data_nascimento: '1990-05-20', genero: 'FEMININO' },
  { id: '4', nome: 'Ana Paula Diniz', referencia: 'Vizinha do bloco B', whatsapp: '19992345678', instagram: 'anapaula.diniz', data_nascimento: '1993-12-04', genero: 'FEMININO' },
  { id: '5', nome: 'Juliana Santos', referencia: 'Amiga do trabalho', whatsapp: '19988776655', instagram: 'ju.santos', data_nascimento: '1996-08-15', genero: 'FEMININO' },
  { id: '6', nome: 'Lucas Miranda', referencia: 'Namorado da Bia / Presentes', whatsapp: '19991122334', data_nascimento: '1992-11-25', genero: 'MASCULINO' }
];

const INITIAL_PRODUTOS = [
  { id: '1', nome: 'Esfoliante Facial Rosa Mosqueta', preco_venda: 28.00, preco_custo: 14.00, estoque: 8, categoria_id: 'cat-2', categoria: 'Skincare', marca: 'Ruby Rose', emoji: '🧴', alerta_estoque_baixo: true, estoque_minimo: 2, ativo: true },
  { id: '2', nome: 'Gloss Labial Love Volume', preco_venda: 22.00, preco_custo: 10.00, estoque: 12, categoria_id: 'cat-3', categoria: 'Boca & Gloss', marca: 'Melu', emoji: '💋', alerta_estoque_baixo: true, estoque_minimo: 3, ativo: true },
  { id: '3', nome: 'Kit Presente Men Gel + Pomada', preco_venda: 55.00, preco_custo: 28.00, estoque: 3, categoria_id: 'cat-5', categoria: 'Kits & Presentes', marca: 'Eudora', emoji: '🎁', alerta_estoque_baixo: true, estoque_minimo: 1, ativo: true },
  { id: '4', nome: 'Perfume Masculino Selvagem 40', preco_venda: 95.00, preco_custo: 48.00, estoque: 5, categoria_id: 'cat-6', categoria: 'Perfumaria', marca: 'Natura', emoji: '✨', alerta_estoque_baixo: true, estoque_minimo: 2, ativo: true },
  { id: '5', nome: 'Bolsa Tiracolo Marrom Croco', preco_venda: 130.00, preco_custo: 75.00, estoque: 1, categoria_id: 'cat-7', categoria: 'Acessórios & Bolsas', marca: 'Radiant Própria', emoji: '👜', alerta_estoque_baixo: true, estoque_minimo: 1, ativo: true },
  { id: '6', nome: 'Kit Skincare La Belle Mosquet', preco_venda: 65.00, preco_custo: 32.00, estoque: 4, categoria_id: 'cat-2', categoria: 'Skincare', marca: 'Bruna Tavares', emoji: '🧴', alerta_estoque_baixo: true, estoque_minimo: 2, ativo: true },
  { id: '7', nome: 'Base Líquida Matte Velvet', preco_venda: 45.00, preco_custo: 24.00, estoque: 1, categoria_id: 'cat-1', categoria: 'Makes', marca: 'Boca Rosa', emoji: '💄', alerta_estoque_baixo: true, estoque_minimo: 2, ativo: true },
  { id: '8', nome: 'Paleta Sombras Chocofun', preco_venda: 58.00, preco_custo: 29.00, estoque: 7, categoria_id: 'cat-4', categoria: 'Olhos & Sobrancelhas', marca: 'Franciny Ehlke', emoji: '👁️', alerta_estoque_baixo: true, estoque_minimo: 2, ativo: true }
];

const INITIAL_VENDAS = [
  {
    id: 'v-101',
    cliente_nome: 'Carla Menezes',
    cliente_whatsapp: '19976543210',
    data: '2026-10-04T14:30:00Z',
    itens: [{ produtoId: '5', nome: 'Bolsa Tiracolo Marrom Croco', quantidade: 1, precoUnitario: 130.00, subtotal: 130.00 }],
    total: 130.00,
    forma_pagamento: 'PRAZO',
    quantidade_parcelas: 2,
    data_vencimento: '2026-11-04',
    status_cobranca: 'PENDENTE'
  },
  {
    id: 'v-102',
    cliente_nome: 'Camila Silva',
    cliente_whatsapp: '19987654321',
    data: '2026-10-10T16:00:00Z',
    itens: [
      { produtoId: '1', nome: 'Esfoliante Facial Rosa Mosqueta', quantidade: 1, precoUnitario: 28.00, subtotal: 28.00 },
      { produtoId: '2', nome: 'Gloss Labial Love Volume', quantidade: 1, precoUnitario: 22.00, subtotal: 22.00 }
    ],
    total: 50.00,
    forma_pagamento: 'PRAZO',
    quantidade_parcelas: 1,
    data_vencimento: '2026-11-10',
    status_cobranca: 'PENDENTE'
  }
];

const INITIAL_COBRANCAS = [
  {
    id: 'cob-1',
    venda_id: 'v-101',
    cliente_nome: 'Carla Menezes',
    cliente_whatsapp: '19976543210',
    descricao_itens: 'Bolsa Tiracolo Marrom Croco',
    valor: 65.00,
    data_vencimento: '2026-11-04',
    status: 'ATRASADO',
    forma_pagamento: 'PRAZO',
    numero_parcela: 1,
    total_parcelas: 2,
    itens_detalhados: [{ produtoId: '5', nome: 'Bolsa Tiracolo Marrom Croco', quantidade: 1, precoUnitario: 130.00, subtotal: 130.00 }]
  },
  {
    id: 'cob-1-p2',
    venda_id: 'v-101',
    cliente_nome: 'Carla Menezes',
    cliente_whatsapp: '19976543210',
    descricao_itens: 'Bolsa Tiracolo Marrom Croco',
    valor: 65.00,
    data_vencimento: '2026-12-04',
    status: 'PENDENTE',
    forma_pagamento: 'PRAZO',
    numero_parcela: 2,
    total_parcelas: 2,
    itens_detalhados: [{ produtoId: '5', nome: 'Bolsa Tiracolo Marrom Croco', quantidade: 1, precoUnitario: 130.00, subtotal: 130.00 }]
  },
  {
    id: 'cob-2',
    venda_id: 'v-102',
    cliente_nome: 'Camila Silva',
    cliente_whatsapp: '19987654321',
    descricao_itens: 'Esfoliante Facial Rosa Mosqueta, Gloss Labial Love Volume',
    valor: 50.00,
    data_vencimento: '2026-11-10',
    status: 'PENDENTE',
    forma_pagamento: 'PRAZO',
    numero_parcela: 1,
    total_parcelas: 1,
    itens_detalhados: [
      { produtoId: '1', nome: 'Esfoliante Facial Rosa Mosqueta', quantidade: 1, precoUnitario: 28.00, subtotal: 28.00 },
      { produtoId: '2', nome: 'Gloss Labial Love Volume', quantidade: 1, precoUnitario: 22.00, subtotal: 22.00 }
    ]
  }
];

async function seed() {
  console.log('Populando dados iniciais no Supabase...');
  
  const { error: errCli } = await supabase.from('clientes').upsert(INITIAL_CLIENTES);
  if (errCli) console.error('Erro clientes:', errCli);
  else console.log('✅ Clientes inseridos!');

  const { error: errProd } = await supabase.from('produtos').upsert(INITIAL_PRODUTOS);
  if (errProd) console.error('Erro produtos:', errProd);
  else console.log('✅ Produtos inseridos!');

  const { error: errVendas } = await supabase.from('vendas').upsert(INITIAL_VENDAS);
  if (errVendas) console.error('Erro vendas:', errVendas);
  else console.log('✅ Vendas inseridas!');

  const { error: errCob } = await supabase.from('cobrancas').upsert(INITIAL_COBRANCAS);
  if (errCob) console.error('Erro cobranças:', errCob);
  else console.log('✅ Cobranças inseridas!');

  console.log('🎉 Dados iniciais sincronizados com sucesso no Supabase!');
}

seed();

