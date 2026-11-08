import React from 'react';
import { PlusCircle, CalendarClock, MessageCircle, ArrowUpRight, TrendingUp, Gift, AlertTriangle, BarChart3 } from 'lucide-react';
import { Venda, Cobranca, ConfiguracoesLoja, Cliente, Produto } from '../types';
import { formatCurrency, formatDateBR, gerarLinkWhatsAppLembrete } from '../utils/whatsapp';

interface DashboardProps {
  vendas: Venda[];
  cobrancas: Cobranca[];
  clientes: Cliente[];
  produtos: Produto[];
  config: ConfiguracoesLoja;
  onNovaVenda: () => void;
  onVerCobrancas: () => void;
  onAbrirCampanhas: () => void;
  onAbrirCatalogo: () => void;
  onAbrirRelatorios: () => void;
  onAbrirClientes?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  vendas,
  cobrancas,
  clientes,
  produtos,
  config,
  onNovaVenda,
  onVerCobrancas,
  onAbrirCampanhas,
  onAbrirCatalogo,
  onAbrirRelatorios,
  onAbrirClientes,
}) => {
  const hoje = new Date().toISOString().split('T')[0];
  const mesAtual = new Date().getMonth() + 1; // 1-12

  // Aniversariantes do Mês
  const aniversariantesMes = clientes.filter(c => {
    if (!c.dataNascimento) return false;
    const partes = c.dataNascimento.split('-');
    const mes = partes.length === 3 ? parseInt(partes[1], 10) : parseInt(partes[0], 10);
    return mes === mesAtual;
  });

  // Produtos com estoque baixo
  const produtosEstoqueBaixo = produtos.filter(p => {
    const limite = p.estoqueMinimo !== undefined ? p.estoqueMinimo : 1;
    return p.alertaEstoqueBaixo !== false && p.estoque <= limite;
  });

  // Cálculos financeiros
  const totalVendido = vendas.reduce((acc, v) => acc + v.total, 0) + 2450; // Base inicial
  const totalRecebido = vendas
    .filter(v => v.formaPagamento !== 'PRAZO' || v.statusCobranca === 'PAGO')
    .reduce((acc, v) => acc + v.total, 0) + 1620;

  const totalAReceber = cobrancas
    .filter(c => c.status !== 'PAGO')
    .reduce((acc, c) => acc + c.valor, 0);

  // Cobranças urgentes de hoje ou atrasadas
  const cobrancasHoje = cobrancas.filter(c => c.status !== 'PAGO' && (c.dataVencimento <= hoje));

  return (
    <div className="space-y-4">
      {/* Card de Faturamento do Mês */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden border border-stone-800">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-radiant-pink/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-radiant-pink" />
            Resumo do Mês
          </span>
          <span className="text-[11px] bg-white/10 text-stone-300 px-2 py-0.5 rounded-full font-medium">
            Novembro
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-extrabold text-white">
            {formatCurrency(totalVendido)}
          </span>
          <span className="text-xs text-emerald-400 font-medium flex items-center">
            <ArrowUpRight className="w-3 h-3" /> {vendas.length + 18} vendas
          </span>
        </div>

        {/* Divisão: Recebido x A Receber */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-stone-700/60 text-xs">
          <div>
            <p className="text-stone-400 font-medium">Recebido no Caixa</p>
            <p className="text-emerald-400 font-bold text-base mt-0.5">
              {formatCurrency(totalRecebido)}
            </p>
          </div>
          <div>
            <p className="text-stone-400 font-medium">A Receber (Fiado)</p>
            <p className="text-amber-400 font-bold text-base mt-0.5">
              {formatCurrency(totalAReceber)}
            </p>
          </div>
        </div>
      </div>

      {/* Alertas Inteligentes do Dia: Aniversários, Estoque & Clientes */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {/* Card Aniversariantes */}
        <div
          onClick={onAbrirCampanhas}
          className="bg-rose-50/80 border border-rose-200/90 rounded-2xl p-2.5 cursor-pointer hover:bg-rose-100/70 transition space-y-1 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm">🎂</span>
            <span className="text-[9px] font-bold text-radiant-pink bg-white px-1 py-0.2 rounded-full border border-rose-200">
              {aniversariantesMes.length}
            </span>
          </div>
          <p className="font-bold text-stone-900 leading-tight text-[11px]">Nivers</p>
          <p className="text-[9px] text-stone-500 truncate">Cupons mês</p>
        </div>

        {/* Card Estoque Baixo */}
        <div
          onClick={onAbrirCatalogo}
          className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-2.5 cursor-pointer hover:bg-amber-100/70 transition space-y-1 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm">⚠️</span>
            <span className="text-[9px] font-bold text-amber-800 bg-white px-1 py-0.2 rounded-full border border-amber-200">
              {produtosEstoqueBaixo.length}
            </span>
          </div>
          <p className="font-bold text-stone-900 leading-tight text-[11px]">Estoque</p>
          <p className="text-[9px] text-stone-500 truncate">Reposição</p>
        </div>

        {/* Card Minhas Clientes */}
        <div
          onClick={onAbrirClientes}
          className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-2.5 cursor-pointer hover:bg-purple-100/70 transition space-y-1 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm">👥</span>
            <span className="text-[9px] font-bold text-purple-700 bg-white px-1 py-0.2 rounded-full border border-purple-200">
              {clientes.length}
            </span>
          </div>
          <p className="font-bold text-stone-900 leading-tight text-[11px]">Clientes</p>
          <p className="text-[9px] text-stone-500 truncate">Gerenciar</p>
        </div>
      </div>

      {/* Alerta de Lembretes do Dia */}
      {cobrancasHoje.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 className="font-bold text-sm text-amber-950">
                {cobrancasHoje.length} {cobrancasHoje.length === 1 ? 'Lembrete Urgente' : 'Lembretes Urgentes'}
              </h3>
            </div>
            <button
              onClick={onVerCobrancas}
              className="text-xs font-semibold text-radiant-pink hover:underline"
            >
              Ver todos
            </button>
          </div>
          
          <p className="text-xs text-amber-800 mb-3 leading-relaxed">
            Envie a mensagem carinhosa com a sua chave Pix em 1 clique:
          </p>

          <div className="space-y-2">
            {cobrancasHoje.slice(0, 3).map((item) => {
              const atrasado = item.dataVencimento < hoje;
              const linkWhats = gerarLinkWhatsAppLembrete(
                item.clienteNome,
                item.clienteWhatsapp,
                item.descricaoItens,
                item.valor,
                item.dataVencimento,
                atrasado,
                config,
                item.numeroParcela,
                item.totalParcelas
              );

              return (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-2xl flex items-center justify-between border border-amber-100 shadow-sm"
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-stone-900">{item.clienteNome}</p>
                      {item.totalParcelas && item.totalParcelas > 1 && (
                        <span className="text-[9px] bg-rose-50 text-radiant-pink px-1 rounded font-bold">
                          {item.numeroParcela}/{item.totalParcelas}
                        </span>
                      )}
                      {atrasado && (
                        <span className="text-[9px] bg-rose-100 text-rose-700 px-1 rounded font-bold">
                          Atrasado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 truncate max-w-[170px]">
                      {item.descricaoItens} • {formatCurrency(item.valor)}
                    </p>
                  </div>

                  <a
                    href={linkWhats}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Lembrar
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Acesso Rápido */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onNovaVenda}
          className="bg-white border border-rose-200/90 hover:border-radiant-pink p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow transition group active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-radiant-pink group-hover:scale-110 transition shadow-inner">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold text-stone-800 mt-2">Nova Venda</span>
          <span className="text-[10px] text-stone-500">Registrar em 15s</span>
        </button>

        <button
          onClick={onVerCobrancas}
          className="bg-white border border-rose-200/90 hover:border-radiant-pink p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow transition group active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition shadow-inner">
            <CalendarClock className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold text-stone-800 mt-2">Quem me deve</span>
          <span className="text-[10px] text-stone-500">Contas a receber</span>
        </button>
      </div>

      {/* Histórico Recente e Atalho de Relatórios */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-stone-800">Últimas Vendas</h3>
          <button
            onClick={onAbrirRelatorios}
            className="text-[11px] text-radiant-pink font-bold flex items-center gap-1 hover:underline"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Relatórios & Lucro
          </button>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {vendas.length === 0 ? (
            <>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900">Juliana Santos</p>
                  <p className="text-[11px] text-stone-500">Perfume Selvagem 40ml</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-900">R$ 95,00</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    Pix Recebido
                  </span>
                </div>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900">Mariana Costa</p>
                  <p className="text-[11px] text-stone-500">Kit Presente Stitch</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-900">R$ 78,00</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    Vence 20/11
                  </span>
                </div>
              </div>
            </>
          ) : (
            vendas.slice(0, 5).map(v => (
              <div key={v.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900">{v.clienteNome}</p>
                  <p className="text-[11px] text-stone-500 truncate max-w-[180px]">
                    {v.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-stone-900">{formatCurrency(v.total)}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      v.formaPagamento === 'PRAZO'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {v.formaPagamento === 'PRAZO'
                      ? `Vence ${formatDateBR(v.dataVencimento || '')}`
                      : 'À Vista'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
