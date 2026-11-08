import React, { useState } from 'react';
import { MessageCircle, CheckCircle2, Clock, AlertTriangle, Check, Search, Calendar, Eye, X, Edit3 } from 'lucide-react';
import { Cobranca, ConfiguracoesLoja } from '../types';
import { formatCurrency, formatDateBR, formatFullDateBR, gerarLinkWhatsAppLembrete, extrairPrimeiroNome } from '../utils/whatsapp';

interface CobrancasProps {
  cobrancas: Cobranca[];
  config: ConfiguracoesLoja;
  onDarBaixa: (id: string) => void;
  onAtualizarVencimento: (id: string, novaData: string) => void;
}

export const Cobrancas: React.FC<CobrancasProps> = ({
  cobrancas,
  config,
  onDarBaixa,
  onAtualizarVencimento,
}) => {
  const [filtro, setFiltro] = useState<'TODOS' | 'VENCIDOS' | 'HOJE' | 'FUTURO'>('TODOS');
  const [busca, setBusca] = useState('');

  // Modal de Detalhes do Pedido
  const [cobrancaDetalhe, setCobrancaDetalhe] = useState<Cobranca | null>(null);

  // Modal de Alteração de Vencimento
  const [cobrancaEditandoData, setCobrancaEditandoData] = useState<Cobranca | null>(null);
  const [novaDataVencimento, setNovaDataVencimento] = useState<string>('');

  const hoje = new Date().toISOString().split('T')[0];

  // Classificação em tempo real
  const cobrancasComStatus = cobrancas.map(c => {
    let statusReal = c.status;
    if (c.status !== 'PAGO') {
      if (c.dataVencimento < hoje) {
        statusReal = 'ATRASADO';
      } else {
        statusReal = 'PENDENTE';
      }
    }
    return { ...c, status: statusReal };
  });

  // Filtros
  const filtradas = cobrancasComStatus.filter(c => {
    const matchBusca =
      c.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
      c.descricaoItens.toLowerCase().includes(busca.toLowerCase());

    if (!matchBusca) return false;

    if (filtro === 'VENCIDOS') return c.status === 'ATRASADO';
    if (filtro === 'HOJE') return c.status !== 'PAGO' && c.dataVencimento === hoje;
    if (filtro === 'FUTURO') return c.status !== 'PAGO' && c.dataVencimento > hoje;
    return true;
  });

  const totalAReceber = cobrancasComStatus
    .filter(c => c.status !== 'PAGO')
    .reduce((acc, c) => acc + c.valor, 0);

  const countVencidos = cobrancasComStatus.filter(c => c.status === 'ATRASADO').length;
  const countHoje = cobrancasComStatus.filter(c => c.status !== 'PAGO' && c.dataVencimento === hoje).length;

  const abrirEdicaoData = (c: Cobranca, e: React.MouseEvent) => {
    e.stopPropagation();
    setCobrancaEditandoData(c);
    setNovaDataVencimento(c.dataVencimento);
  };

  const salvarNovaData = () => {
    if (!cobrancaEditandoData || !novaDataVencimento) return;
    onAtualizarVencimento(cobrancaEditandoData.id, novaDataVencimento);
    setCobrancaEditandoData(null);
  };

  return (
    <div className="space-y-4">
      {/* Topo com Resumo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-stone-900">💸 Quem Me Deve</h2>
          <p className="text-xs text-stone-500">
            Total a receber: <b className="text-amber-600 font-bold">{formatCurrency(totalAReceber)}</b>
          </p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-xl">
          {cobrancasComStatus.filter(c => c.status !== 'PAGO').length} pendentes
        </span>
      </div>

      {/* Campo de Busca Rápida */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por cliente ou produto..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full text-xs bg-white border border-stone-200 rounded-2xl px-3 py-2.5 pl-8 focus:outline-none focus:border-radiant-pink shadow-sm"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
      </div>

      {/* Abas de Filtragem */}
      <div className="flex gap-1.5 bg-stone-200/60 p-1 rounded-2xl text-xs font-semibold text-stone-600">
        <button
          onClick={() => setFiltro('TODOS')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            filtro === 'TODOS' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-900'
          }`}
        >
          Todos ({cobrancas.length})
        </button>

        <button
          onClick={() => setFiltro('VENCIDOS')}
          className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
            filtro === 'VENCIDOS'
              ? 'bg-rose-500 text-white shadow-sm font-bold'
              : 'text-rose-600 hover:text-rose-700'
          }`}
        >
          Vencidos {countVencidos > 0 && `(${countVencidos})`}
        </button>

        <button
          onClick={() => setFiltro('HOJE')}
          className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
            filtro === 'HOJE'
              ? 'bg-amber-500 text-white shadow-sm font-bold'
              : 'text-amber-600 hover:text-amber-700'
          }`}
        >
          Hoje {countHoje > 0 && `(${countHoje})`}
        </button>

        <button
          onClick={() => setFiltro('FUTURO')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            filtro === 'FUTURO' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-900'
          }`}
        >
          Futuro
        </button>
      </div>

      {/* Lista de Cobranças */}
      <div className="space-y-3">
        {filtradas.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-stone-400 border border-stone-100">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-80" />
            <p className="text-xs font-bold text-stone-700">Tudo em dia!</p>
            <p className="text-[11px] text-stone-400 mt-0.5">Nenhuma cobrança encontrada nesta aba.</p>
          </div>
        ) : (
          filtradas.map(c => {
            const isPago = c.status === 'PAGO';
            const isAtrasado = c.status === 'ATRASADO';
            const isHoje = c.dataVencimento === hoje && !isPago;

            const linkWhats = gerarLinkWhatsAppLembrete(
              c.clienteNome,
              c.clienteWhatsapp,
              c.descricaoItens,
              c.valor,
              c.dataVencimento,
              isAtrasado,
              config,
              c.numeroParcela,
              c.totalParcelas
            );

            return (
              <div
                key={c.id}
                onClick={() => setCobrancaDetalhe(c)}
                className={`bg-white p-4 rounded-3xl border shadow-sm transition space-y-3 cursor-pointer hover:border-radiant-pink/60 ${
                  isPago
                    ? 'border-emerald-200 opacity-60 bg-emerald-50/20'
                    : isAtrasado
                    ? 'border-l-4 border-l-rose-500 border-stone-200'
                    : isHoje
                    ? 'border-l-4 border-l-amber-500 border-stone-200'
                    : 'border-l-4 border-l-stone-300 border-stone-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    {/* Badges de Status e Parcela */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isPago ? (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ✓ Recebido
                        </span>
                      ) : isAtrasado ? (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Atrasado
                        </span>
                      ) : isHoje ? (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Vence Hoje
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          A vencer
                        </span>
                      )}

                      {/* Badge de Forma de Pagamento e Parcela */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-radiant-pink border border-rose-200">
                        A Prazo {c.totalParcelas && c.totalParcelas > 1 ? `• Parcela ${c.numeroParcela || 1} de ${c.totalParcelas}` : '• Parcela Única'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-stone-900 mt-1.5 flex items-center gap-1">
                      {c.clienteNome}
                      <span className="text-[10px] text-stone-400 font-normal">(toque para ver itens)</span>
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-1">{c.descricaoItens}</p>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <p
                      className={`font-extrabold text-base ${
                        isPago
                          ? 'text-emerald-600'
                          : isAtrasado
                          ? 'text-rose-600'
                          : 'text-stone-900'
                      }`}
                    >
                      {formatCurrency(c.valor)}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <p className="text-[11px] text-stone-400">
                        Venc: {formatDateBR(c.dataVencimento)}
                      </p>
                      {!isPago && (
                        <button
                          type="button"
                          onClick={(e) => abrirEdicaoData(c, e)}
                          title="Alterar data de vencimento"
                          className="p-1 rounded text-stone-400 hover:text-radiant-pink hover:bg-rose-50 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {!isPago && (
                  <div className="pt-2 border-t border-stone-100 flex gap-2">
                    <a
                      href={linkWhats}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 border border-emerald-200/80 py-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      {isAtrasado ? 'Cobrar no WhatsApp' : 'Lembrar no WhatsApp'}
                    </a>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDarBaixa(c.id);
                      }}
                      className="bg-stone-900 hover:bg-stone-800 active:scale-95 text-white px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Baixa Pix
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DETALHES DO PEDIDO / COBRANÇA */}
      {cobrancaDetalhe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-stone-900">Detalhes do Pedido</h3>
                <p className="text-[11px] text-stone-400">Ref: #{cobrancaDetalhe.vendaId}</p>
              </div>
              <button
                onClick={() => setCobrancaDetalhe(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Informações da Cliente e Parcela */}
            <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 text-xs space-y-1">
              <p className="font-bold text-stone-900">{cobrancaDetalhe.clienteNome}</p>
              <p className="text-stone-600">WhatsApp: {cobrancaDetalhe.clienteWhatsapp}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-semibold text-radiant-pink">
                  Condição: A Prazo ({cobrancaDetalhe.totalParcelas && cobrancaDetalhe.totalParcelas > 1 ? `Parcela ${cobrancaDetalhe.numeroParcela || 1} de ${cobrancaDetalhe.totalParcelas}` : '1x Parcela Única'})
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Vencimento desta parcela: <b>{formatFullDateBR(cobrancaDetalhe.dataVencimento)}</b>
              </p>
            </div>

            {/* Lista dos Produtos */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-stone-700">Produtos do Pedido:</p>
              <div className="max-h-40 overflow-y-auto divide-y divide-stone-100 border border-stone-100 rounded-xl p-2 bg-stone-50/50">
                {cobrancaDetalhe.itensDetalhados && cobrancaDetalhe.itensDetalhados.length > 0 ? (
                  cobrancaDetalhe.itensDetalhados.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-stone-800">{it.quantidade}x {it.nome}</span>
                        <p className="text-[10px] text-stone-400">{formatCurrency(it.precoUnitario)} cada</p>
                      </div>
                      <span className="font-bold text-stone-900">{formatCurrency(it.subtotal)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-600 py-1">{cobrancaDetalhe.descricaoItens}</p>
                )}
              </div>
            </div>

            {/* Valor desta parcela */}
            <div className="bg-stone-50 p-3 rounded-2xl flex items-center justify-between text-xs">
              <span className="font-medium text-stone-600">Valor desta cobrança:</span>
              <span className="font-extrabold text-base text-radiant-pink">
                {formatCurrency(cobrancaDetalhe.valor)}
              </span>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  abrirEdicaoData(cobrancaDetalhe, e);
                  setCobrancaDetalhe(null);
                }}
                className="flex-1 bg-stone-100 hover:bg-stone-200 py-2.5 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                Mudar Vencimento
              </button>

              {cobrancaDetalhe.status !== 'PAGO' && (
                <button
                  type="button"
                  onClick={() => {
                    onDarBaixa(cobrancaDetalhe.id);
                    setCobrancaDetalhe(null);
                  }}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  Dar Baixa
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL MUDAR DATA DE COBRANÇA */}
      {cobrancaEditandoData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-radiant-pink" />
              Mudar Data de Vencimento
            </h3>
            <p className="text-xs text-stone-500">
              Renegociar vencimento para <b>{cobrancaEditandoData.clienteNome}</b>:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Nova Data Combinada</label>
                <input
                  type="date"
                  value={novaDataVencimento}
                  onChange={e => setNovaDataVencimento(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink font-bold"
                />
              </div>

              {/* Atalhos Rápidos */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setNovaDataVencimento(d.toISOString().split('T')[0]);
                  }}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 py-1.5 rounded-lg text-[10px] font-semibold text-stone-700"
                >
                  +7 Dias
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 15);
                    setNovaDataVencimento(d.toISOString().split('T')[0]);
                  }}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 py-1.5 rounded-lg text-[10px] font-semibold text-stone-700"
                >
                  +15 Dias
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 1);
                    setNovaDataVencimento(d.toISOString().split('T')[0]);
                  }}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 py-1.5 rounded-lg text-[10px] font-semibold text-stone-700"
                >
                  +1 Mês
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCobrancaEditandoData(null)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 py-2.5 rounded-xl text-xs font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarNovaData}
                className="flex-1 bg-radiant-pink hover:bg-rose-600 py-2.5 rounded-xl text-xs font-bold text-white shadow"
              >
                Salvar Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
