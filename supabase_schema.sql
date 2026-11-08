-- ==============================================================================
-- 🌸 RADIANT MAKE — SCRIPT DE BANCO DE DADOS SUPABASE (PostgreSQL)
-- ==============================================================================
-- Este script cria todas as tabelas necessárias para sincronizar o sistema
-- da Radiant Make entre computador e celular em tempo real.
--
-- Como usar:
-- 1. Crie uma conta gratuita em https://supabase.com
-- 2. Crie um novo projeto chamado "radiant-make"
-- 3. No menu lateral do Supabase, clique em "SQL Editor"
-- 4. Cole este script completo e clique em "Run" (Executar)
-- ==============================================================================

-- 1. TABELA DE CONFIGURAÇÕES DA LOJA
CREATE TABLE IF NOT EXISTS public.configuracoes_loja (
    id TEXT PRIMARY KEY DEFAULT 'config_principal',
    nome_loja TEXT NOT NULL DEFAULT 'Radiant Make',
    chave_pix TEXT NOT NULL,
    tipo_chave_pix TEXT NOT NULL DEFAULT 'Celular',
    whatsapp_loja TEXT NOT NULL,
    cupom_aniversario_padrao TEXT DEFAULT 'NIVER10',
    mensagem_agradecimento TEXT,
    mensagem_lembrete TEXT,
    mensagem_cobranca TEXT,
    mensagem_aniversario TEXT,
    mensagem_data_comemorativa TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    emoji TEXT NOT NULL DEFAULT '💄',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE MARCAS PARCEIRAS
CREATE TABLE IF NOT EXISTS public.marcas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    referencia TEXT, -- Ex: "Luana cabeleireira / Salão Bella"
    whatsapp TEXT NOT NULL,
    instagram TEXT,
    data_nascimento DATE,
    genero TEXT DEFAULT 'FEMININO', -- 'FEMININO', 'MASCULINO', 'OUTRO'
    total_comprado NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.produtos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    preco_venda NUMERIC(10, 2) NOT NULL,
    preco_custo NUMERIC(10, 2) DEFAULT 0.00,
    estoque INTEGER NOT NULL DEFAULT 0,
    categoria_id TEXT REFERENCES public.categorias(id) ON DELETE SET NULL,
    categoria TEXT NOT NULL,
    marca TEXT,
    emoji TEXT DEFAULT '💄',
    foto_url TEXT,
    alerta_estoque_baixo BOOLEAN DEFAULT true,
    estoque_minimo INTEGER DEFAULT 1,
    ativo BOOLEAN DEFAULT true, -- false = arquivado
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE VENDAS
CREATE TABLE IF NOT EXISTS public.vendas (
    id TEXT PRIMARY KEY, -- Ex: "PED-1234"
    cliente_id TEXT REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nome TEXT NOT NULL,
    cliente_whatsapp TEXT NOT NULL,
    data TIMESTAMPTZ DEFAULT NOW(),
    itens JSONB NOT NULL, -- Array de ItemVenda [{produtoId, nome, quantidade, precoUnitario, subtotal}]
    total NUMERIC(10, 2) NOT NULL,
    forma_pagamento TEXT NOT NULL, -- 'PIX', 'DINHEIRO', 'CARTAO', 'PRAZO'
    quantidade_parcelas INTEGER DEFAULT 1,
    data_vencimento DATE,
    status_cobranca TEXT NOT NULL DEFAULT 'PAGO', -- 'PENDENTE', 'PAGO', 'ATRASADO'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE COBRANÇAS (PARCELAS & QUEM ME DEVE)
CREATE TABLE IF NOT EXISTS public.cobrancas (
    id TEXT PRIMARY KEY, -- Ex: "cob-PED-1234-p1"
    venda_id TEXT REFERENCES public.vendas(id) ON DELETE CASCADE,
    cliente_id TEXT REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nome TEXT NOT NULL,
    cliente_whatsapp TEXT NOT NULL,
    descricao_itens TEXT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'PAGO', 'ATRASADO'
    data_pagamento TIMESTAMPTZ,
    forma_pagamento TEXT DEFAULT 'PRAZO',
    numero_parcela INTEGER DEFAULT 1,
    total_parcelas INTEGER DEFAULT 1,
    itens_detalhados JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES PARA CONSULTAS ULTRA RÁPIDAS
CREATE INDEX IF NOT EXISTS idx_cobrancas_vencimento ON public.cobrancas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON public.cobrancas(status);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes(nome);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON public.produtos(nome);

-- POLÍTICAS DE ACESSO (Row Level Security com acesso aberto para a chave da aplicação)
ALTER TABLE public.configuracoes_loja ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total configuracoes" ON public.configuracoes_loja;
CREATE POLICY "Acesso total configuracoes" ON public.configuracoes_loja FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total categorias" ON public.categorias;
CREATE POLICY "Acesso total categorias" ON public.categorias FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total marcas" ON public.marcas;
CREATE POLICY "Acesso total marcas" ON public.marcas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total clientes" ON public.clientes;
CREATE POLICY "Acesso total clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total produtos" ON public.produtos;
CREATE POLICY "Acesso total produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total vendas" ON public.vendas;
CREATE POLICY "Acesso total vendas" ON public.vendas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total cobrancas" ON public.cobrancas;
CREATE POLICY "Acesso total cobrancas" ON public.cobrancas FOR ALL USING (true) WITH CHECK (true);

-- HABILITAR REALTIME (Para o celular atualizar na hora que o PC salvar algo e vice-versa)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.produtos;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cobrancas;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

-- ==============================================================================
-- DADOS INICIAIS DA RADIANT MAKE (SEEDS)
-- ==============================================================================

INSERT INTO public.configuracoes_loja (
    id, nome_loja, chave_pix, tipo_chave_pix, whatsapp_loja, cupom_aniversario_padrao,
    mensagem_agradecimento, mensagem_lembrete, mensagem_cobranca, mensagem_aniversario, mensagem_data_comemorativa
) VALUES (
    'config_principal',
    'Radiant Make',
    '19999999999',
    'Celular',
    '19999999999',
    'NIVER10',
    'Oi, {nome}! ✨ Passando para agradecer pela sua compra na Radiant Make! Seu pedido #{pedidoId} ({itens}) ficou em R$ {valor}. Qualquer dúvida estou por aqui! 💖',
    'Oi, {nome}! Tudo bem? 🌸 Passando com carinho para lembrar que sua parcela {parcela} de R$ {valor} da Radiant Make referente a ({itens}) vence {quando}. Chave Pix ({tipoPix}): {chavePix}. Quando fizer, só me mandar o comprovante por aqui! Obrigada! ✨',
    'Oi, {nome}! Tudo bem? 🌸 Passando para conferir se deu tudo certo com você. Constou aqui que a sua parcela {parcela} de R$ {valor} referente a ({itens}) venceu dia {dataVencimento}. Se já fez o Pix, me manda o comprovante por favor para eu dar baixa? Chave Pix: {chavePix}. Muito obrigada! 💖',
    'Parabéns pelo seu dia, {nome}! 🎂✨ Desejo muitas felicidades, saúde e realizações! Para comemorar, preparei um mimo especial: use o cupom *{cupom}* e ganhe 10% de desconto em qualquer produtinho este mês! 💖 Aproveite o seu dia!',
    'Oi, {nome}! 🌸 Passando para desejar uma semana iluminada e avisar que chegaram novidades incríveis de makes e autocuidado na Radiant Make! ✨ Se quiser ver o catálogo atualizado, é só me responder aqui! 💖'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categorias (id, nome, emoji) VALUES
    ('cat-1', 'Makes', '💄'),
    ('cat-2', 'Skincare', '🧴'),
    ('cat-3', 'Boca & Gloss', '💋'),
    ('cat-4', 'Olhos & Sobrancelhas', '👁️'),
    ('cat-5', 'Kits & Presentes', '🎁'),
    ('cat-6', 'Perfumaria', '✨'),
    ('cat-7', 'Acessórios & Bolsas', '👜')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.marcas (id, nome) VALUES
    ('m-1', 'Ruby Rose'),
    ('m-2', 'Bruna Tavares'),
    ('m-3', 'Boca Rosa'),
    ('m-4', 'Franciny Ehlke'),
    ('m-5', 'Melu'),
    ('m-6', 'Eudora'),
    ('m-7', 'Natura'),
    ('m-8', 'O Boticário'),
    ('m-9', 'Radiant Própria')
ON CONFLICT (id) DO NOTHING;

