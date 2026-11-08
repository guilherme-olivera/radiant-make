# 🌸 Radiant Make — Sistema de Gestão & Cobrança Express

> **Documento de Contexto, Especificação e Continuidade do Projeto**  
> *Criado para manter o histórico completo das decisões tomadas e permitir a continuidade perfeita em um novo chat/workspace.*

---

## 📌 1. O Problema & A Oportunidade

* **Negócio:** Loja de cosméticos, maquiagens e acessórios (**Radiant Make** — Piracicaba/SP).
* **Desafio:** A loja é uma atividade extra exercida paralelamente ao trabalho formal. O volume de vendas aumentou e o controle manual começou a fugir do controle.
* **Processo Antigo:** 
  - Fotos tiradas dos produtos com preço na galeria do celular.
  - Anotações dispersas em caderninho/notas sobre quem comprou.
  - Vendas a prazo ("fiado"/combinado para o dia do pagamento) para clientes conhecidas.
  - Muito tempo perdido conferindo anotações e cobrando as pessoas manualmente uma a uma no WhatsApp.
* **Objetivo do Sistema:** 
  - Ter agilidade extrema no registro de vendas (máximo 15 a 20 segundos no celular).
  - Controle visual de "Quem me deve" e contas a receber.
  - Comunicação ágil via WhatsApp dedicado com mensagens de agradecimento e lembretes de cobrança delicados contendo valor e chave Pix em 1 clique.

---

## 📍 2. Localização dos Arquivos & Estrutura Criada

O projeto foi criado em uma pasta independente:
📁 **Caminho:** `E:\Projetos\radiant-make`

```
E:\Projetos\radiant-make\
├── public\
│   └── manifest.json          # Manifesto PWA para instalação no celular
├── src\
│   ├── components\
│   │   ├── Header.tsx         # Barra superior com notificações e atalhos rápidos
│   │   ├── BottomNav.tsx      # Barra de navegação inferior estilo app móvel
│   │   ├── Dashboard.tsx      # Visão financeira do mês, aniversariantes e alertas de estoque
│   │   ├── NovaVenda.tsx      # Registro em 15s com parcelamento 1x, 2x, 3x e fotos reais
│   │   ├── Cobrancas.tsx      # "Quem me deve", parcelas, remarcação de vencimento e detalhes
│   │   ├── Catalogo.tsx       # Catálogo com fotos, Custo Médio Ponderado, margem e alerta de estoque
│   │   ├── Relatorios.tsx     # Métricas de faturamento, margem de lucro e histórico
│   │   └── Configuracoes.tsx  # Campanhas WhatsApp, Categorias/Marcas, Nuvem Supabase e Pix
│   ├── services\
│   │   ├── storage.ts         # Persistência local (LocalStorage) offline-first com seeds
│   │   ├── supabase.ts        # Cliente Supabase configurado
│   │   └── sync.ts            # Sincronização bidirecional nuvem <-> local
│   ├── utils\
│   │   ├── whatsapp.ts        # Formatador de links wa.me com tags dinâmicas
│   │   └── image.ts           # Compressão automática de fotos no navegador
│   ├── types\
│   │   └── index.ts           # Interfaces TypeScript completas
│   ├── App.tsx                # Orquestração do app com sincronização em segundo plano
│   ├── index.css              # Estilos globais e utilitários Tailwind
│   └── main.tsx               # Ponto de entrada React
├── supabase_schema.sql        # Script SQL executado no banco PostgreSQL do Supabase
├── vercel.json                # Configuração para deploy instantâneo na Vercel
├── .env                       # Variáveis de ambiente configuradas com Supabase
└── .gitignore                 # Proteção de credenciais e dependências
├── index.html                 # Template HTML com meta tags mobile
├── tailwind.config.js         # Paleta de cores da Radiant Make (rosa, dourado, nude)
├── vite.config.ts             # Configuração do Vite (porta 5173, host habilitado)
├── tsconfig.json              # Configurações do TypeScript
└── package.json               # Dependências do projeto (React 18, Tailwind, Lucide Icons)
```

---

## 🛠️ 3. Tecnologias & Arquitetura

* **Frontend / Aplicação:** **React + Vite + TypeScript + Tailwind CSS**
* **Ícones:** **Lucide React**
* **Estilo Visual:** Design *mobile-first*, paleta suave da Radiant Make (`radiant-pink`, tons nude e dourado).
* **Persistência de Dados Atual:** `LocalStorage` no navegador com dados iniciais realistas da loja (produtos, clientes, cobranças pré-cadastradas).
* **Próximo Passo de Backend:** Conexão com **Supabase** (PostgreSQL gratuito) para sincronização multi-dispositivo (celular e PC simultaneamente) e armazenamento das fotos no Supabase Storage.
* **Mensageria WhatsApp:** Links diretos `https://wa.me/` com mensagens prontas e formatadas (custo zero, sem risco de banimento e acionável com 1 toque).

---

## 📱 4. Funcionalidades Já Implementadas e Prontas

### A. Dashboard Principal (`Dashboard.tsx`)
- Resumo do faturamento no mês.
- Divisão clara entre **Recebido no Caixa** vs. **A Receber na Rua (Fiado)**.
- Card de **Lembretes Urgentes do Dia**: lista clientes com vencimento na data atual com botão verde de disparo direto para o WhatsApp.
- Botão flutuante central para iniciar uma **Nova Venda**.
- Histórico recente das últimas vendas.

### B. Nova Venda Express em 15s (`NovaVenda.tsx`)
- **Cliente:** Busca preditiva por nome ou referência ("Luana cabeleireira", "Mercado JJR").
- **Cadastro Completo:** Nome, Referência pessoal, WhatsApp, Data de Aniversário (com tag visual 🎂) e Gênero (Feminino/Masculino/Outro).
- **Busca de Produtos & Filtros Rápidos:** Digitação em tempo real (nome, marca ou categoria) e chips de toque rápido (`⭐ Mais Vendidos`, marcas parceiras como *Ruby Rose*, *Boca Rosa*, *Melu*, *Bruna Tavares*, etc.).
- **Item Avulso:** Botão `+ Item Avulso` para digitar descrição e preço na hora.
- **Forma de Pagamento:**
  - *À Vista:* Pix, Dinheiro ou Cartão.
  - *A Prazo (Fiado):* Parcelamento flexível em **1x, 2x ou 3x** com divisão automática dos valores e datas futuras a cada 30 dias.
- **Ação Pós-Venda:** Modal de sucesso com disparo direto para WhatsApp da cliente usando apenas o primeiro nome dela (preservando discrição e afeto).

### C. Quem Me Deve / Cobranças (`Cobrancas.tsx`)
- Abas com contadores dinâmicos: **Todos**, **🔴 Vencidos**, **🟡 Vence Hoje** e **Futuro**.
- **Identificação Completa da Parcela:** Badges indicando claramente `A Prazo • Parcela 1 de 2` ou `Parcela 2 de 3`.
- **Mudar Data de Vencimento:** Botão de edição rápida direto no card (atalhos de +7 dias, +15 dias, +1 mês ou calendário).
- **Visualização do Pedido Completo:** Ao tocar no card da cobrança, abre o modal detalhado com todos os itens, quantidades, valores unitários e total.
- **Botões de Ação:** Disparo no WhatsApp e botão **"Baixa Pix"** em 1 clique.

### D. Catálogo & Estoque Inteligente (`Catalogo.tsx`)
- Grade de produtos com categorias, marcas parceiras, fotos reais e emojis herdados.
- **Upload Real de Fotos dos Produtos:**
  - Botão de upload com câmera direta no celular ou escolha da galeria/PC.
  - Compressão automática via Canvas no navegador (fotos de 10 MB ficam com ~45 KB sem perder nitidez).
  - Preview imediato com opção de trocar ou remover foto.
  - Exibição da foto nos cards do Catálogo e na tela de Nova Venda Express.
- **Estruturação por Categorias & Marcas:** O emoji é cadastrado na categoria e herdado automaticamente pelo produto se não tiver foto.
- **Abastecimento com Custo Médio Ponderado (CMP):**
  - Botão `+ Abastecer` em cada card de produto.
  - Cálculo instantâneo: consolida o estoque antigo + novo lote e calcula a média ponderada do custo por unidade.
  - Cálculo transparente de **Margem de Lucro (% em cima do custo)** e lucro total do lote.
  - Campo para reajustar o preço de venda na hora se desejar.
- **Exclusão e Desativação (Arquivamento):**
  - Opção de **Desativar / Arquivar** produto (some das vendas ativas mas preserva o histórico de vendas passadas e relatórios).
  - Opção de **Excluir definitivamente** para itens que nunca mais serão comercializados.
  - Abas para alternar entre produtos *Ativos* e *Arquivados*.
- **Alerta Customizado de Estoque Baixo:** Cada produto possui configuração própria (ex: alertar quando o estoque for ≤ 1 ou ≤ 2 unidades com badge visual pulsante).
- Cadastro rápido com atalhos inline para criar novas categorias e marcas na hora.

### E. Configurações & Central de Campanhas WhatsApp (`Configuracoes.tsx`)
- **Central de Disparo de Campanhas:**
  - Segmentação por público: *🎂 Aniversariantes do Mês*, *👩 Mulheres*, *👨 Homens*, *👥 Todos os Clientes* ou *🔍 Cliente Específica*.
  - Modelos prontos: *Parabéns com Cupom de Desconto*, *Novidades & Datas Comemorativas*, *Agradecimento* ou *Texto Personalizado*.
  - Disparo individual para o WhatsApp com 1 toque por cliente elegível.
- **Gestão de Categorias e Marcas:** Adicionar/remover categorias com emojis e marcas parceiras.
- **Modelos de Mensagens:** Customização com tags `{nome}`, `{cupom}`, `{chavePix}`, `{valor}`, `{parcela}`, etc.
- **Dados Pix:** Chave Pix, tipo de chave e WhatsApp da loja.

---

## 💬 5. Modelos das Mensagens de WhatsApp Configuradas

### Mensagem de Agradecimento (Pós-Venda):
> *"Oi, {nome}! ✨ Passando para agradecer pela compra na Radiant Make! Seu pedido #{pedidoId} ({itens}) ficou em R$ {valor}. Qualquer dúvida estou por aqui! 💖"*

### Lembrete Amigável (Dia do Vencimento):
> *"Oi, {nome}! Tudo bem? 🌸 Passando com carinho para lembrar que sua parcela de R$ {valor} da Radiant Make referente a ({itens}) vence {quando}. Chave Pix ({tipoPix}): {chavePix}. Quando fizer, só me mandar o comprovante por aqui! Obrigada! ✨"*

### Cobrança Delicada (Parcela Vencida):
> *"Oi, {nome}! Tudo bem? 🌸 Passando para conferir se deu tudo certo com você. Constou aqui que a sua parcela de R$ {valor} referente a ({itens}) venceu dia {dataVencimento}. Se já fez o Pix, me manda o comprovante por favor para eu dar baixa? Chave Pix: {chavePix}. Muito obrigada! 💖"*

---

## 🚀 6. Como Rodar a Aplicação

Abra um terminal na pasta do projeto:
```powershell
cd E:\Projetos\radiant-make
npm run dev
```

* **Acesso pelo Computador:** [http://localhost:5173](http://localhost:5173)
* **Acesso pelo Celular na mesma rede Wi-Fi:** `http://<IP-DO-SEU-PC>:5173` (Ex: `http://192.168.15.11:5173`)
* *Dica para o celular:* Abra no navegador do celular (Chrome/Safari) e selecione **"Adicionar à tela de início"** para usar em tela cheia como um aplicativo nativo.

---

## 🎯 7. Próximos Passos Sugeridos para o Novo Chat

1. **Conectar ao Supabase (Banco na Nuvem):**
   - Criar tabelas no Supabase (`clientes`, `produtos`, `vendas`, `cobrancas`).
   - Permitir que você acesse tanto do PC quanto do celular com os mesmos dados sincronizados em tempo real.
2. **Upload Real de Fotos dos Produtos:**
   - Permitir tirar foto direto da câmera do celular e salvar no cadastro do produto.
3. **Deploy Gratuito (Vercel ou Netlify):**
   - Colocar o app no ar em um link fixo seguro (ex: `radiantmake.vercel.app`) para você usar de qualquer lugar sem precisar do computador ligado.
