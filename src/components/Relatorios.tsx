import React, { useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Award, Download, MessageCircle, Trash2, Calendar, FileSpreadsheet, Package, Sparkles } from 'lucide-react';
import { Venda, Produto, ConfiguracoesLoja } from '../types';
import { formatCurrency, formatDateBR, cleanPhone, abrirLinkWhatsApp } from '../utils/whatsapp';

interface RelatoriosProps {
  vendas: Venda[];
  produtos: Produto[];
  config: ConfiguracoesLoja;
  onExcluirVenda: (id: string) => void;
}

export const Relatorios: React.FC<RelatoriosProps> = ({
  vendas,
  produtos,
  config,
  onExcluirVenda,
}) => {
  const [abaPrincipal, setAbaPrincipal] = useState<'VENDAS' | 'ESTOQUE'>('VENDAS');
  const [periodo, setPeriodo] = useState<'MES' | '7DIAS' | 'TODOS'>('MES');
  const [buscaEstoque, setBuscaEstoque] = useState('');

  // Filtro por período
  const agora = new Date();
  const vendasFiltradas = vendas.filter(v => {
    if (periodo === 'TODOS') return true;
    const dataVenda = new Date(v.data);
    if (periodo === 'MES') {
      return (
        dataVenda.getMonth() === agora.getMonth() &&
        dataVenda.getFullYear() === agora.getFullYear()
      );
    }
    if (periodo === '7DIAS') {
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(agora.getDate() - 7);
      return dataVenda >= seteDiasAtras;
    }
    return true;
  });

  // Cálculos de Vendas
  const faturamento = vendasFiltradas.reduce((acc, v) => acc + v.total, 0);

  // Lucro estimado (Venda - Custo)
  let custoTotal = 0;
  vendasFiltradas.forEach(v => {
    v.itens.forEach(item => {
      const p = produtos.find(prod => prod.id === item.produtoId);
      const custoUnitario = p?.precoCusto || item.precoUnitario * 0.5; // fallback 50%
      custoTotal += custoUnitario * item.quantidade;
    });
  });
  const lucroEstimado = faturamento - custoTotal;
  const ticketMedio = vendasFiltradas.length > 0 ? faturamento / vendasFiltradas.length : 0;
  const totalDescontosConcedidos = vendasFiltradas.reduce((acc, v) => acc + (v.desconto || 0), 0);

  // Ranking de Produtos mais vendidos
  const rankingMap: { [nome: string]: { quantidade: number; total: number; emoji?: string } } = {};
  vendasFiltradas.forEach(v => {
    v.itens.forEach(item => {
      const p = produtos.find(prod => prod.id === item.produtoId);
      if (!rankingMap[item.nome]) {
        rankingMap[item.nome] = { quantidade: 0, total: 0, emoji: p?.emoji || '✨' };
      }
      rankingMap[item.nome].quantidade += item.quantidade;
      rankingMap[item.nome].total += item.subtotal;
    });
  });

  const topProdutos = Object.entries(rankingMap)
    .sort((a, b) => b[1].quantidade - a[1].quantidade)
    .slice(0, 5);

  // --- CÁLCULOS DO RELATÓRIO DE ESTOQUE (INVESTIMENTO X FATURAMENTO ESTIMADO) ---
  const produtosAtivos = produtos.filter(p => p.ativo !== false);
  const totalPecasEstoque = produtosAtivos.reduce((acc, p) => acc + (p.estoque || 0), 0);
  const totalInvestidoEstoque = produtosAtivos.reduce((acc, p) => acc + ((p.precoCusto || 0) * (p.estoque || 0)), 0);
  const faturamentoEsperadoEstoque = produtosAtivos.reduce((acc, p) => acc + ((p.precoVenda || 0) * (p.estoque || 0)), 0);
  const lucroBrutoProjetado = faturamentoEsperadoEstoque - totalInvestidoEstoque;
  const margemPercentualProjetada = totalInvestidoEstoque > 0 ? (lucroBrutoProjetado / totalInvestidoEstoque) * 100 : 0;

  // Filtro de produtos na aba de estoque
  const produtosFiltradosEstoque = produtosAtivos.filter(p => {
    const termo = buscaEstoque.toLowerCase().trim();
    if (!termo) return true;
    return p.nome.toLowerCase().includes(termo) || (p.marca && p.marca.toLowerCase().includes(termo)) || p.categoria.toLowerCase().includes(termo);
  });

  // Reenviar comprovante no WhatsApp
  const handleReenviarComprovante = (venda: Venda) => {
    const primeiroNome = venda.clienteNome.split(' ')[0];
    const itensTexto = venda.itens.map(i => `${i.quantidade}x ${i.nome} - ${formatCurrency(i.precoUnitario)}`).join('\n');

    let texto = `Oi, ${primeiroNome}! ✨ Aqui está a 2ª via do seu comprovante da Radiant Make:\n\n🛍️ *Resumo do Pedido #${venda.id}:*\n${itensTexto}\n\n💰 *Total:* ${formatCurrency(venda.total)}`;

    if (venda.formaPagamento === 'PRAZO' && venda.dataVencimento) {
      texto += `\n\n📅 *Vencimento:* ${formatDateBR(venda.dataVencimento)}\n🔑 *Chave Pix (${config.tipoChavePix}):* ${config.chavePix}\n\nAssim que fizer o Pix no dia combinado, é só me mandar o comprovante aqui. Muito obrigada pela confiança! 🌸`;
    }

    abrirLinkWhatsApp(venda.clienteWhatsapp, texto);
  };

  // Exportar Relatório em CSV (compatível com Excel)
  const exportarCSV = () => {
    if (abaPrincipal === 'VENDAS') {
      if (vendasFiltradas.length === 0) {
        alert('Não há vendas no período selecionado para exportar.');
        return;
      }

      const headers = ['ID Pedido', 'Data', 'Cliente', 'WhatsApp', 'Itens', 'Subtotal (R$)', 'Desconto (R$)', 'Total (R$)', 'Pagamento', 'Vencimento', 'Status'];
      const rows = vendasFiltradas.map(v => {
        const sub = v.subtotal || (v.total + (v.desconto || 0));
        return [
          v.id,
          new Date(v.data).toLocaleDateString('pt-BR'),
          `"${v.clienteNome}"`,
          v.clienteWhatsapp,
          `"${v.itens.map(i => `${i.quantidade}x ${i.nome}`).join('; ')}"`,
          sub.toFixed(2).replace('.', ','),
          (v.desconto || 0).toFixed(2).replace('.', ','),
          v.total.toFixed(2).replace('.', ','),
          v.formaPagamento,
          v.dataVencimento ? formatDateBR(v.dataVencimento) : 'À Vista',
          v.statusCobranca,
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_vendas_radiant_${periodo.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Exportar Estoque
      const headers = ['Produto', 'Marca', 'Categoria', 'Estoque', 'Preço de Custo (R$)', 'Preço de Venda (R$)', 'Total Investido (R$)', 'Faturamento Esperado (R$)', 'Lucro Projetado (R$)'];
      const rows = produtosAtivos.map(p => {
        const investido = (p.precoCusto || 0) * (p.estoque || 0);
        const faturamentoP = (p.precoVenda || 0) * (p.estoque || 0);
        const lucro = faturamentoP - investido;
        return [
          `"${p.nome}"`,
          `"${p.marca || 'Sem Marca'}"`,
          `"${p.categoria}"`,
          p.estoque,
          (p.precoCusto || 0).toFixed(2).replace('.', ','),
          p.precoVenda.toFixed(2).replace('.', ','),
          investido.toFixed(2).replace('.', ','),
          faturamentoP.toFixed(2).replace('.', ','),
          lucro.toFixed(2).replace('.', ',')
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_estoque_investido_radiant.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-radiant-pink" />
            Relatórios & Desempenho
          </h2>
          <p className="text-xs text-stone-500">Métricas financeiras, estoque e histórico</p>
        </div>

        <button
          onClick={exportarCSV}
          title="Baixar planilha Excel/CSV"
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Exportar
        </button>
      </div>

      {/* Abas Principais: Vendas x Patrimônio/Estoque */}
      <div className="grid grid-cols-2 gap-2 bg-stone-200/70 p-1 rounded-2xl text-xs font-bold text-stone-600">
        <button
          type="button"
          onClick={() => setAbaPrincipal('VENDAS')}
          className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            abaPrincipal === 'VENDAS'
              ? 'bg-radiant-pink text-white shadow-sm font-extrabold'
              : 'hover:text-stone-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Vendas & Lucro
        </button>

        <button
          type="button"
          onClick={() => setAbaPrincipal('ESTOQUE')}
          className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
            abaPrincipal === 'ESTOQUE'
              ? 'bg-radiant-pink text-white shadow-sm font-extrabold'
              : 'hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          Investimento x Estoque
        </button>
      </div>

      {/* --- CONTEÚDO DA ABA VENDAS --- */}
      {abaPrincipal === 'VENDAS' && (
        <div className="space-y-4">
          {/* Seletor de Período */}
          <div className="flex gap-1.5 bg-stone-200/60 p-1 rounded-2xl text-xs font-semibold text-stone-600">
            <button
              onClick={() => setPeriodo('MES')}
              className={`flex-1 py-1.5 rounded-xl transition ${
                periodo === 'MES' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-900'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriodo('7DIAS')}
              className={`flex-1 py-1.5 rounded-xl transition ${
                periodo === '7DIAS' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-900'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setPeriodo('TODOS')}
              className={`flex-1 py-1.5 rounded-xl transition ${
                periodo === 'TODOS' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-900'
              }`}
            >
              Todas
            </button>
          </div>

          {/* Cards de Métricas de Vendas */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3.5 rounded-3xl border border-stone-100 shadow-sm">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Faturamento
              </span>
              <p className="text-xl font-black text-stone-900">{formatCurrency(faturamento)}</p>
              <span className="text-[10px] text-stone-500 mt-1 block">
                {vendasFiltradas.length} {vendasFiltradas.length === 1 ? 'venda registrada' : 'vendas registradas'}
              </span>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3.5 rounded-3xl border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Lucro Bruto Realizado
              </span>
              <p className="text-xl font-black text-emerald-800">{formatCurrency(lucroEstimado)}</p>
              <span className="text-[10px] text-emerald-600 mt-1 block">
                Margem média: {faturamento > 0 ? ((lucroEstimado / faturamento) * 100).toFixed(0) : 0}%
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-3xl border border-stone-100 shadow-sm">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Ticket Médio
              </span>
              <p className="text-base font-extrabold text-stone-900">{formatCurrency(ticketMedio)}</p>
              <span className="text-[10px] text-stone-500 mt-1 block">Por cliente/pedido</span>
            </div>

            <div className="bg-white p-3.5 rounded-3xl border border-stone-100 shadow-sm">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Descontos Concedidos
              </span>
              <p className="text-base font-extrabold text-stone-900">
                {formatCurrency(totalDescontosConcedidos)}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Fidelização</span>
            </div>
          </div>

          {/* Ranking Top Produtos */}
          {topProdutos.length > 0 && (
            <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Mais Vendidos do Período
                </h3>
                <span className="text-[10px] text-stone-400">Por volume</span>
              </div>

              <div className="space-y-2">
                {topProdutos.map(([nome, dados], idx) => (
                  <div key={nome} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      <span className="w-5 h-5 rounded-full bg-rose-50 text-radiant-pink flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}º
                      </span>
                      <span className="font-semibold text-stone-800 truncate">{nome}</span>
                      <span className="text-[10px] text-stone-400 shrink-0">({dados.quantidade} un)</span>
                    </div>
                    <span className="font-extrabold text-radiant-pink">{formatCurrency(dados.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico Detalhado de Vendas */}
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-stone-800">Histórico de Vendas ({vendasFiltradas.length})</h3>

            {vendasFiltradas.length === 0 ? (
              <p className="text-center text-xs text-stone-400 py-6">
                Nenhuma venda registrada neste período.
              </p>
            ) : (
              <div className="space-y-2.5">
                {vendasFiltradas.map(v => (
                  <div key={v.id} className="p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 text-xs space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-stone-900">{v.clienteNome}</span>
                          <span className="text-[9px] text-stone-400">#{v.id}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">
                          {v.itens.map(i => `${i.quantidade}x ${i.nome} (${formatCurrency(i.precoUnitario)})`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-stone-900">{formatCurrency(v.total)}</p>
                        {v.desconto && v.desconto > 0 && (
                          <p className="text-[10px] text-emerald-600 font-bold">
                            Desc: -{formatCurrency(v.desconto)}
                          </p>
                        )}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold inline-block mt-0.5 ${
                          v.formaPagamento === 'PRAZO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {v.formaPagamento === 'PRAZO'
                            ? `Venc: ${formatDateBR(v.dataVencimento || '')}`
                            : 'À Vista'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 text-[11px]">
                      <span className="text-stone-400">
                        {new Date(v.data).toLocaleDateString('pt-BR')} às {new Date(v.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReenviarComprovante(v)}
                          title="Reenviar comprovante no WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente cancelar e excluir o pedido #${v.id}? Os produtos voltarão automaticamente para o estoque!`)) {
                              onExcluirVenda(v.id);
                            }
                          }}
                          title="Excluir venda e devolver ao estoque"
                          className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CONTEÚDO DA ABA ESTOQUE (INVESTIMENTO X FATURAMENTO ESPERADO) --- */}
      {abaPrincipal === 'ESTOQUE' && (
        <div className="space-y-4">
          {/* Card Resumo Consolidado do Estoque */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-5 rounded-3xl shadow-xl space-y-4 border border-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-rose-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-radiant-pink fill-radiant-pink" />
                Patrimônio em Estoque
              </span>
              <span className="text-[11px] bg-white/10 text-stone-200 px-2 py-0.5 rounded-full font-bold">
                {totalPecasEstoque} unidades
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Valor Investido (Custo)</p>
                <p className="text-xl font-black text-rose-300 mt-0.5">
                  {formatCurrency(totalInvestidoEstoque)}
                </p>
                <span className="text-[10px] text-stone-400">Total pago nas compras</span>
              </div>

              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Faturamento Estimado</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">
                  {formatCurrency(faturamentoEsperadoEstoque)}
                </p>
                <span className="text-[10px] text-stone-400">Venda de 100% dos itens</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-semibold block">Lucro Bruto Projetado:</span>
                <span className="text-base font-extrabold text-white">
                  + {formatCurrency(lucroBrutoProjetado)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 font-semibold block">Retorno / Margem:</span>
                <span className="text-sm font-black text-emerald-400">
                  +{margemPercentualProjetada.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Produtos com Custo x Venda */}
          <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-stone-800">
                Detalhamento dos Produtos ({produtosFiltradosEstoque.length})
              </h3>
            </div>

            <input
              type="text"
              placeholder="Buscar por produto, marca ou categoria..."
              value={buscaEstoque}
              onChange={e => setBuscaEstoque(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:border-radiant-pink"
            />

            <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
              {produtosFiltradosEstoque.map(p => {
                const totalCustoItem = (p.precoCusto || 0) * (p.estoque || 0);
                const totalVendaItem = (p.precoVenda || 0) * (p.estoque || 0);

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-stone-50/80 border border-stone-200/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-stone-900 truncate">{p.nome}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-0.5">
                          {p.marca && <span className="text-radiant-pink font-semibold">{p.marca}</span>}
                          <span>•</span>
                          <span>{p.categoria}</span>
                        </div>
                      </div>

                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 ${
                        p.estoque <= (p.estoqueMinimo || 1)
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}>
                        {p.estoque} un
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-stone-200/60 text-[10px]">
                      <div>
                        <span className="text-stone-400 block">Unitário (C / V):</span>
                        <span className="font-medium text-stone-700">
                          {formatCurrency(p.precoCusto || 0)} / <b>{formatCurrency(p.precoVenda)}</b>
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 block">Investido:</span>
                        <span className="font-bold text-rose-600">
                          {formatCurrency(totalCustoItem)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-stone-400 block">Retorno Esperado:</span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(totalVendaItem)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
