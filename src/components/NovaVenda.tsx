import React, { useState } from 'react';
import { Search, UserPlus, Plus, Minus, Check, Calendar, MessageCircle, Sparkles, Tag, Heart } from 'lucide-react';
import { Cliente, Produto, ItemVenda, FormaPagamento, Venda, ConfiguracoesLoja, GeneroCliente } from '../types';
import { formatCurrency, formatDateBR, cleanPhone, extrairPrimeiroNome } from '../utils/whatsapp';

interface NovaVendaProps {
  clientes: Cliente[];
  produtos: Produto[];
  config: ConfiguracoesLoja;
  onSalvarVenda: (venda: Venda) => void;
  onCadastrarCliente: (cliente: Cliente) => void;
  onVoltar: () => void;
}

export const NovaVenda: React.FC<NovaVendaProps> = ({
  clientes,
  produtos,
  config,
  onSalvarVenda,
  onCadastrarCliente,
  onVoltar,
}) => {
  // Estado do Cliente
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(clientes[0] || null);
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaReferencia, setNovaReferencia] = useState('');
  const [novoWhats, setNovoWhats] = useState('');
  const [novoNiver, setNovoNiver] = useState('');
  const [novoGenero, setNovoGenero] = useState<GeneroCliente>('FEMININO');

  // Filtro e Busca de Produtos
  const [buscaProduto, setBuscaProduto] = useState('');
  const [filtroRapido, setFiltroRapido] = useState<string>('TODOS');

  // Itens da Venda (Carrinho)
  const [carrinho, setCarrinho] = useState<{ [produtoId: string]: number }>({
    '1': 1,
    '2': 1,
  });

  // Item Avulso
  const [modalAvulso, setModalAvulso] = useState(false);
  const [avulsoNome, setAvulsoNome] = useState('');
  const [avulsoPreco, setAvulsoPreco] = useState('');
  const [itensAvulsos, setItensAvulsos] = useState<ItemVenda[]>([]);

  // Condição de Pagamento
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PRAZO');
  const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(1);
  const [dataVencimento, setDataVencimento] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  // Modal Pós-Venda (Sucesso e WhatsApp)
  const [vendaConcluida, setVendaConcluida] = useState<Venda | null>(null);

  // Filtragem de clientes (por nome ou por referência)
  const clientesFiltrados = clientes.filter(c => {
    const termo = buscaCliente.toLowerCase();
    const matchNome = c.nome.toLowerCase().includes(termo);
    const matchRef = c.referencia ? c.referencia.toLowerCase().includes(termo) : false;
    return matchNome || matchRef;
  });

  // Marcas e Categorias para chips de filtro rápido
  const marcasDisponiveis = Array.from(new Set(produtos.map(p => p.marca).filter(Boolean))) as string[];

  // Filtragem de produtos (busca textual + filtro rápido)
  const produtosFiltrados = produtos.filter(p => {
    if (p.ativo === false) return false;

    const termo = buscaProduto.toLowerCase().trim();
    const matchTexto = termo === '' ||
      p.nome.toLowerCase().includes(termo) ||
      (p.marca && p.marca.toLowerCase().includes(termo)) ||
      p.categoria.toLowerCase().includes(termo);

    if (!matchTexto) return false;

    if (filtroRapido === 'TODOS') return true;
    if (filtroRapido === 'MAIS_VENDIDOS') {
      return ['1', '2', '3', '7'].includes(p.id);
    }
    return p.marca === filtroRapido || p.categoria === filtroRapido;
  });

  // Manipulação de Carrinho
  const adicionarAoCarrinho = (pId: string) => {
    setCarrinho(prev => ({
      ...prev,
      [pId]: (prev[pId] || 0) + 1,
    }));
  };

  const removerDoCarrinho = (pId: string) => {
    setCarrinho(prev => {
      const q = (prev[pId] || 0) - 1;
      if (q <= 0) {
        const copy = { ...prev };
        delete copy[pId];
        return copy;
      }
      return { ...prev, [pId]: q };
    });
  };

  // Cálculo Total
  const itensProdutos: ItemVenda[] = Object.entries(carrinho).map(([pId, qtd]) => {
    const p = produtos.find(item => item.id === pId);
    return {
      produtoId: pId,
      nome: p ? p.nome : 'Produto',
      quantidade: qtd,
      precoUnitario: p ? p.precoVenda : 0,
      subtotal: (p ? p.precoVenda : 0) * qtd,
    };
  });

  const todosItens = [...itensProdutos, ...itensAvulsos];
  const totalGeral = todosItens.reduce((acc, i) => acc + i.subtotal, 0);
  const valorParcela = totalGeral > 0 ? (totalGeral / quantidadeParcelas) : 0;

  // Ação Adicionar Item Avulso
  const handleAdicionarAvulso = () => {
    const preco = parseFloat(avulsoPreco.replace(',', '.'));
    if (!avulsoNome || isNaN(preco) || preco <= 0) return;

    setItensAvulsos(prev => [
      ...prev,
      {
        produtoId: 'avulso-' + Date.now(),
        nome: avulsoNome,
        quantidade: 1,
        precoUnitario: preco,
        subtotal: preco,
      },
    ]);
    setAvulsoNome('');
    setAvulsoPreco('');
    setModalAvulso(false);
  };

  // Ação Salvar Novo Cliente
  const handleSalvarCliente = () => {
    if (!novoNome.trim()) {
      alert('Preencha o nome da cliente.');
      return;
    }
    const novo: Cliente = {
      id: 'cli-' + Date.now(),
      nome: novoNome.trim(),
      referencia: novaReferencia.trim() || undefined,
      whatsapp: cleanPhone(novoWhats),
      dataNascimento: novoNiver || undefined,
      genero: novoGenero,
    };
    onCadastrarCliente(novo);
    setClienteSelecionado(novo);
    setNovoNome('');
    setNovaReferencia('');
    setNovoWhats('');
    setNovoNiver('');
    setModalNovoCliente(false);
  };

  // Finalizar Venda
  const handleFinalizar = () => {
    if (!clienteSelecionado) {
      alert('Por favor, selecione ou cadastre uma cliente.');
      return;
    }
    if (todosItens.length === 0) {
      alert('Selecione pelo menos um produto para a venda.');
      return;
    }

    const novaVenda: Venda = {
      id: 'PED-' + Math.floor(1000 + Math.random() * 9000),
      clienteId: clienteSelecionado.id,
      clienteNome: clienteSelecionado.nome,
      clienteWhatsapp: clienteSelecionado.whatsapp,
      data: new Date().toISOString(),
      itens: todosItens,
      total: totalGeral,
      formaPagamento,
      quantidadeParcelas: formaPagamento === 'PRAZO' ? quantidadeParcelas : 1,
      dataVencimento: formaPagamento === 'PRAZO' ? dataVencimento : undefined,
      statusCobranca: formaPagamento === 'PRAZO' ? 'PENDENTE' : 'PAGO',
    };

    onSalvarVenda(novaVenda);
    setVendaConcluida(novaVenda);
  };

  // Disparar WhatsApp da Venda
  const handleEnviarWhatsApp = () => {
    if (!vendaConcluida) return;
    const primeiroNome = extrairPrimeiroNome(vendaConcluida.clienteNome);
    const itensTexto = vendaConcluida.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ');
    const phone = cleanPhone(vendaConcluida.clienteWhatsapp);

    let texto = `Oi, ${primeiroNome}! ✨ Muito obrigada pela sua compra na Radiant Make! 💖\n\n🛍️ *Resumo do Pedido #${vendaConcluida.id}:*\n${itensTexto}\n💰 *Total:* ${formatCurrency(vendaConcluida.total)}`;

    if (vendaConcluida.formaPagamento === 'PRAZO' && vendaConcluida.dataVencimento) {
      const qParcelas = vendaConcluida.quantidadeParcelas || 1;
      if (qParcelas > 1) {
        texto += `\n\n📅 *Condição Combinada:* ${qParcelas}x de ${formatCurrency(vendaConcluida.total / qParcelas)}`;
        texto += `\n📌 *1ª Parcela:* Vence dia ${formatDateBR(vendaConcluida.dataVencimento)}`;
      } else {
        texto += `\n\n📅 *Vencimento Combinado:* ${formatDateBR(vendaConcluida.dataVencimento)}`;
      }
      texto += `\n🔑 *Chave Pix (${config.tipoChavePix}):* ${config.chavePix}\n\nAssim que fizer o Pix no dia combinado, é só me mandar o comprovante aqui. Muito obrigada pela confiança! 🌸`;
    } else {
      texto += `\n\nQualquer dúvida ou quando quiser reposição dos seus produtinhos, só me chamar aqui! ✨`;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    onVoltar();
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-radiant-pink fill-radiant-pink" />
            Nova Venda Express
          </h2>
          <p className="text-xs text-stone-500">Registro rápido e geração automática de cobrança</p>
        </div>
        <span className="text-[11px] bg-rose-100 text-radiant-pink px-2.5 py-0.5 rounded-full font-bold">
          ⚡ 15 segundos
        </span>
      </div>

      {/* 1. SELEÇÃO DO CLIENTE */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800">1. Para quem você vendeu?</label>
          <button
            onClick={() => setModalNovoCliente(true)}
            className="text-[11px] text-radiant-pink font-bold flex items-center gap-1 hover:underline"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Nova Cliente
          </button>
        </div>

        {clienteSelecionado ? (
          <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-xs text-stone-900">{clienteSelecionado.nome}</p>
                {clienteSelecionado.dataNascimento && (
                  <span className="text-[10px] bg-white text-radiant-pink px-1.5 py-0.2 rounded-full border border-rose-200 font-semibold">
                    🎂 {formatDateBR(clienteSelecionado.dataNascimento)}
                  </span>
                )}
              </div>
              {clienteSelecionado.referencia && (
                <p className="text-[11px] text-radiant-pink font-medium flex items-center gap-1 mt-0.5">
                  <Tag className="w-3 h-3" /> {clienteSelecionado.referencia}
                </p>
              )}
              <p className="text-[10px] text-stone-500 mt-0.5">WhatsApp: {clienteSelecionado.whatsapp}</p>
            </div>
            <button
              onClick={() => setClienteSelecionado(null)}
              className="text-xs text-stone-400 hover:text-stone-700 underline font-medium ml-2"
            >
              Trocar
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome ou referência (ex: Luana, mercado)..."
                value={buscaCliente}
                onChange={e => setBuscaCliente(e.target.value)}
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 pl-8 focus:outline-none focus:border-radiant-pink"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-stone-100 border border-stone-100 rounded-xl bg-white text-xs">
              {clientesFiltrados.length === 0 ? (
                <div className="p-3 text-center text-stone-400">
                  Nenhuma cliente encontrada.
                  <button
                    onClick={() => setModalNovoCliente(true)}
                    className="block mx-auto mt-1 text-radiant-pink font-bold hover:underline"
                  >
                    + Cadastrar agora
                  </button>
                </div>
              ) : (
                clientesFiltrados.slice(0, 5).map(cli => (
                  <div
                    key={cli.id}
                    onClick={() => setClienteSelecionado(cli)}
                    className="p-2.5 hover:bg-rose-50 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-800">{cli.nome}</span>
                        {cli.dataNascimento && (
                          <span className="text-[10px] text-stone-400">🎂</span>
                        )}
                      </div>
                      {cli.referencia && (
                        <p className="text-[10px] text-radiant-pink font-medium truncate max-w-[200px]">
                          {cli.referencia}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400">{cli.whatsapp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. SELEÇÃO DE PRODUTOS */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800">2. Escolha os Produtos</label>
          <button
            onClick={() => setModalAvulso(true)}
            className="text-[11px] text-radiant-pink font-bold hover:underline"
          >
            + Item Avulso
          </button>
        </div>

        {/* Barra de Busca de Produtos */}
        <div className="relative">
          <input
            type="text"
            placeholder="Digitar nome do produto, marca ou categoria..."
            value={buscaProduto}
            onChange={e => setBuscaProduto(e.target.value)}
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 pl-8 focus:outline-none focus:border-radiant-pink shadow-inner"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Chips de Filtro Rápido */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setFiltroRapido('TODOS')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition ${
              filtroRapido === 'TODOS'
                ? 'bg-stone-900 text-white font-bold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todos ({produtos.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido('MAIS_VENDIDOS')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
              filtroRapido === 'MAIS_VENDIDOS'
                ? 'bg-radiant-pink text-white font-bold'
                : 'bg-rose-50 text-radiant-pink hover:bg-rose-100'
            }`}
          >
            ⭐ Mais Vendidos
          </button>

          {marcasDisponiveis.map(marca => (
            <button
              key={marca}
              type="button"
              onClick={() => setFiltroRapido(marca)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition ${
                filtroRapido === marca
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {marca}
            </button>
          ))}
        </div>

        {/* Grade de Produtos */}
        <div className="grid grid-cols-2 gap-2 text-xs max-h-72 overflow-y-auto no-scrollbar pt-1">
          {produtosFiltrados.length === 0 ? (
            <div className="col-span-2 text-center py-6 text-stone-400 text-xs">
              Nenhum produto encontrado com este filtro.
            </div>
          ) : (
            produtosFiltrados.map(prod => {
              const qtd = carrinho[prod.id] || 0;
              const selecionado = qtd > 0;

              return (
                <div
                  key={prod.id}
                  onClick={() => adicionarAoCarrinho(prod.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition border flex flex-col justify-between relative ${
                    selecionado
                      ? 'border-2 border-radiant-pink bg-rose-50/60 shadow-sm'
                      : 'border-stone-200/90 bg-stone-50/50 hover:bg-stone-50'
                  }`}
                >
                  {selecionado && (
                    <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white rounded-full p-0.5 shadow border border-rose-200">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removerDoCarrinho(prod.id);
                        }}
                        className="w-4 h-4 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-[11px] font-extrabold text-radiant-pink px-1">
                        {qtd}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          adicionarAoCarrinho(prod.id);
                        }}
                        className="w-4 h-4 rounded-full bg-radiant-pink text-white flex items-center justify-center hover:bg-rose-600"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      {prod.fotoUrl ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-rose-100 shadow-xs">
                          <img src={prod.fotoUrl} alt={prod.nome} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-xl">{prod.emoji || '✨'}</span>
                      )}
                      {prod.marca && (
                        <span className="text-[9px] bg-stone-200/70 text-stone-700 px-1.5 py-0.2 rounded-md font-bold">
                          {prod.marca}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-stone-900 leading-tight mt-1 line-clamp-2">
                      {prod.nome}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-extrabold text-radiant-pink text-xs">
                      {formatCurrency(prod.precoVenda)}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Est: {prod.estoque}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Itens Avulsos Adicionados */}
        {itensAvulsos.length > 0 && (
          <div className="pt-2 border-t border-stone-100 space-y-1.5">
            <span className="text-[11px] font-bold text-stone-500">Itens Avulsos:</span>
            {itensAvulsos.map((av, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-stone-50 p-2 rounded-xl">
                <span className="font-medium text-stone-800">{av.nome}</span>
                <span className="font-bold text-stone-900">{formatCurrency(av.subtotal)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Resumo do Total */}
        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs font-medium text-stone-500">
            Total ({todosItens.reduce((acc, i) => acc + i.quantidade, 0)} itens):
          </span>
          <span className="font-extrabold text-lg text-stone-900">
            {formatCurrency(totalGeral)}
          </span>
        </div>
      </div>

      {/* 3. FORMA DE PAGAMENTO */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
        <label className="text-xs font-bold text-stone-800">3. Como a cliente vai pagar?</label>
        
        <div className="grid grid-cols-2 gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFormaPagamento('PIX')}
            className={`py-3 px-3 rounded-2xl border transition flex items-center justify-center gap-1.5 ${
              formaPagamento !== 'PRAZO'
                ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-sm'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>💵 À Vista (Pix / Dinheiro)</span>
          </button>

          <button
            type="button"
            onClick={() => setFormaPagamento('PRAZO')}
            className={`py-3 px-3 rounded-2xl border transition flex items-center justify-center gap-1.5 ${
              formaPagamento === 'PRAZO'
                ? 'border-2 border-radiant-pink bg-rose-50 text-radiant-pink font-bold shadow-sm'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>📅 A Prazo (Fiado)</span>
          </button>
        </div>

        {formaPagamento === 'PRAZO' && (
          <div className="pt-2 space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
            {/* Opção de Parcelamento */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-stone-700">Número de Parcelas:</label>
                <span className="text-[11px] font-extrabold text-radiant-pink">
                  {quantidadeParcelas}x de {formatCurrency(valorParcela)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[1, 2, 3].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantidadeParcelas(num)}
                    className={`py-2 rounded-xl border text-center transition font-bold ${
                      quantidadeParcelas === num
                        ? 'bg-radiant-pink text-white border-radiant-pink shadow-sm'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {num}x {num > 1 ? `(${formatCurrency(totalGeral / num)})` : 'Única'}
                  </button>
                ))}
              </div>
            </div>

            {/* Data de Vencimento da 1ª Parcela */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-600 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-radiant-pink" />
                Vencimento da {quantidadeParcelas > 1 ? '1ª Parcela' : 'Parcela'}:
              </label>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDataVencimento('2026-11-10')}
                  className={`py-2 px-2 rounded-xl border text-center transition ${
                    dataVencimento === '2026-11-10'
                      ? 'bg-stone-900 text-white font-bold border-stone-900'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Dia 10/11
                </button>
                <button
                  type="button"
                  onClick={() => setDataVencimento('2026-11-15')}
                  className={`py-2 px-2 rounded-xl border text-center transition ${
                    dataVencimento === '2026-11-15'
                      ? 'bg-stone-900 text-white font-bold border-stone-900'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Dia 15/11
                </button>
                <button
                  type="button"
                  onClick={() => setDataVencimento('2026-11-20')}
                  className={`py-2 px-2 rounded-xl border text-center transition ${
                    dataVencimento === '2026-11-20'
                      ? 'bg-stone-900 text-white font-bold border-stone-900'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Dia 20/11
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-stone-400 font-medium">Ou escolha outra data:</span>
                <input
                  type="date"
                  value={dataVencimento}
                  onChange={e => setDataVencimento(e.target.value)}
                  className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              {quantidadeParcelas > 1 && (
                <p className="text-[10px] text-stone-500 pt-1 italic">
                  * As demais parcelas vencerão automaticamente a cada 30 dias após esta data.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTÃO PRINCIPAL */}
      <button
        onClick={handleFinalizar}
        disabled={totalGeral <= 0}
        className="w-full bg-gradient-to-r from-radiant-pink to-rose-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-extrabold py-4 rounded-3xl shadow-lg shadow-radiant-pink/30 flex items-center justify-center gap-2 transition active:scale-[0.99]"
      >
        <Check className="w-5 h-5 stroke-[2.5]" />
        Salvar Venda & Enviar WhatsApp
      </button>

      {/* MODAL NOVO CLIENTE COM REFERÊNCIA E ANIVERSÁRIO */}
      {modalNovoCliente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3.5">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-radiant-pink" />
              Cadastrar Nova Cliente
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-stone-600 mb-0.5 font-semibold">Nome da Cliente *</label>
                <input
                  type="text"
                  placeholder="Ex: Luana Martins (como vai na mensagem)"
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-0.5 font-semibold">
                  Referência / Onde conhece (para você identificar)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cabeleireira do Salão Bella, Mercado JJR"
                  value={novaReferencia}
                  onChange={e => setNovaReferencia(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              <div>
                <label className="block text-stone-600 mb-0.5 font-semibold">WhatsApp (com DDD)</label>
                <input
                  type="text"
                  placeholder="Ex: 19998877665"
                  value={novoWhats}
                  onChange={e => setNovoWhats(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 mb-0.5 font-semibold">Data Aniversário</label>
                  <input
                    type="date"
                    value={novoNiver}
                    onChange={e => setNovoNiver(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:border-radiant-pink"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-0.5 font-semibold">Gênero</label>
                  <select
                    value={novoGenero}
                    onChange={e => setNovoGenero(e.target.value as GeneroCliente)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:border-radiant-pink"
                  >
                    <option value="FEMININO">Feminino</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="OUTRO">Outro / Neutro</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setModalNovoCliente(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 py-2.5 rounded-xl text-xs font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarCliente}
                className="flex-1 bg-radiant-pink hover:bg-rose-600 py-2.5 rounded-xl text-xs font-bold text-white shadow"
              >
                Salvar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ITEM AVULSO */}
      {modalAvulso && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-stone-900">Adicionar Produto Avulso</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Descrição do Item</label>
                <input
                  type="text"
                  placeholder="Ex: Paleta de Sombras Nude"
                  value={avulsoNome}
                  onChange={e => setAvulsoNome(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                />
              </div>
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Valor (R$)</label>
                <input
                  type="text"
                  placeholder="Ex: 45,00"
                  value={avulsoPreco}
                  onChange={e => setAvulsoPreco(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setModalAvulso(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 py-2.5 rounded-xl text-xs font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarAvulso}
                className="flex-1 bg-radiant-pink hover:bg-rose-600 py-2.5 rounded-xl text-xs font-bold text-white shadow"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO & ENVIO DE WHATSAPP */}
      {vendaConcluida && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">Venda Registrada!</h3>
              <p className="text-xs text-stone-500 mt-1">
                Envie o agradecimento para <b>{extrairPrimeiroNome(vendaConcluida.clienteNome)}</b> no WhatsApp:
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-left text-[11px] text-stone-700 space-y-1 font-mono">
              <p className="font-bold text-radiant-pink font-sans text-xs">Mensagem Pronta:</p>
              <p className="line-clamp-4">
                Oi, {extrairPrimeiroNome(vendaConcluida.clienteNome)}! ✨ Agradecemos pela compra na Radiant Make! Pedido #{vendaConcluida.id} no valor de {formatCurrency(vendaConcluida.total)}. {vendaConcluida.quantidadeParcelas && vendaConcluida.quantidadeParcelas > 1 ? `(${vendaConcluida.quantidadeParcelas}x). ` : ''}Chave Pix ({config.tipoChavePix}): {config.chavePix}. Obrigada! 💖
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleEnviarWhatsApp}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar WhatsApp (1 Toque)
              </button>
              <button
                onClick={onVoltar}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium py-2.5 rounded-2xl text-xs transition"
              >
                Concluir sem Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
