import React, { useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Award, Download, MessageCircle, Trash2, Calendar, FileSpreadsheet } from 'lucide-react';
import { Venda, Produto, ConfiguracoesLoja } from '../types';
import { formatCurrency, formatDateBR, cleanPhone } from '../utils/whatsapp';

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
  const [periodo, setPeriodo] = useState<'MES' | '7DIAS' | 'TODOS'>('MES');

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

  // Cálculos
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

  // Reenviar comprovante no WhatsApp
  const handleReenviarComprovante = (venda: Venda) => {
    const primeiroNome = venda.clienteNome.split(' ')[0];
    const itensTexto = venda.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ');
    const phone = cleanPhone(venda.clienteWhatsapp);

    let texto = `Oi, ${primeiroNome}! ✨ Aqui está a 2ª via do seu comprovante da Radiant Make:\n\n🛍️ *Pedido #${venda.id}:*\n${itensTexto}\n💰 *Total:* ${formatCurrency(venda.total)}`;

    if (venda.formaPagamento === 'PRAZO' && venda.dataVencimento) {
      texto += `\n📅 *Vencimento:* ${formatDateBR(venda.dataVencimento)}\n🔑 *Chave Pix (${config.tipoChavePix}):* ${config.chavePix}`;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  // Exportar Relatório em CSV (compatível com Excel)
  const exportarCSV = () => {
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
          <p className="text-xs text-stone-500">Métricas financeiras e histórico de vendas</p>
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

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-3xl border border-stone-100 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-radiant-pink" />
            Faturamento Bruto
          </span>
          <p className="text-lg font-extrabold text-stone-900">
            {formatCurrency(faturamento)}
          </p>
          <span className="text-[10px] text-stone-400">
            {vendasFiltradas.length} pedidos realizados
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-stone-100 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Lucro Estimado
          </span>
          <p className="text-lg font-extrabold text-emerald-600">
            {formatCurrency(lucroEstimado)}
          </p>
          <span className="text-[10px] text-emerald-700/80 font-medium">
            Livre após custo
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-stone-100 shadow-sm space-y-1 col-span-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400">Ticket Médio por Venda</span>
            <p className="text-base font-extrabold text-stone-800 mt-0.5">
              {formatCurrency(ticketMedio)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-radiant-pink">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Produtos Mais Vendidos */}
      {topProdutos.length > 0 && (
        <div className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Mais Vendidos no Período
            </h3>
            <span className="text-[10px] text-stone-400">Por quantidade</span>
          </div>

          <div className="space-y-2">
            {topProdutos.map(([nome, dados], idx) => (
              <div key={nome} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                    idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-stone-900">{dados.emoji} {nome}</p>
                    <p className="text-[10px] text-stone-400">{dados.quantidade} un vendidas</p>
                  </div>
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
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-stone-900">{v.clienteNome}</span>
                      <span className="text-[9px] text-stone-400">#{v.id}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {v.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-extrabold text-stone-900">{formatCurrency(v.total)}</p>
                    {v.desconto && v.desconto > 0 && (
                      <p className="text-[10px] text-emerald-600 font-bold">
                        Desc: -{formatCurrency(v.desconto)}
                      </p>
                    )}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
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
                        if (confirm(`Deseja realmente cancelar e excluir o pedido #${v.id}?`)) {
                          onExcluirVenda(v.id);
                        }
                      }}
                      title="Excluir venda"
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
  );
};

