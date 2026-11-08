import React, { useState } from 'react';
import { Search, UserPlus, Pencil, Trash2, Phone, Calendar, Heart, Sparkles, MessageCircle, ShoppingBag, ArrowUpDown, X, Check, Eye } from 'lucide-react';
import { Cliente, GeneroCliente, Venda, Cobranca } from '../types';
import { formatCurrency, formatDateBR, cleanPhone, extrairPrimeiroNome } from '../utils/whatsapp';

interface ClientesProps {
  clientes: Cliente[];
  vendas: Venda[];
  cobrancas: Cobranca[];
  onAdicionarCliente: (cliente: Cliente) => void;
  onAtualizarCliente: (cliente: Cliente) => void;
  onExcluirCliente: (id: string) => void;
  onVoltar: () => void;
}

export const Clientes: React.FC<ClientesProps> = ({
  clientes,
  vendas,
  cobrancas,
  onAdicionarCliente,
  onAtualizarCliente,
  onExcluirCliente,
  onVoltar,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroGenero, setFiltroGenero] = useState<string>('TODOS');
  const [ordenacao, setOrdenacao] = useState<'NOME' | 'VALOR' | 'NIVER'>('NOME');

  // Modais
  const [modalNovo, setModalNovo] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);

  // Estados do Formulário (Novo / Edição)
  const [formNome, setFormNome] = useState('');
  const [formReferencia, setFormReferencia] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formDataNascimento, setFormDataNascimento] = useState('');
  const [formGenero, setFormGenero] = useState<GeneroCliente>('FEMININO');

  // Mês atual para destaque de aniversário
  const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');

  // Abrir Modal de Novo
  const abrirModalNovo = () => {
    setFormNome('');
    setFormReferencia('');
    setFormWhatsapp('');
    setFormInstagram('');
    setFormDataNascimento('');
    setFormGenero('FEMININO');
    setModalNovo(true);
  };

  // Abrir Modal de Edição
  const abrirModalEdicao = (c: Cliente, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setClienteEditando(c);
    setFormNome(c.nome);
    setFormReferencia(c.referencia || '');
    setFormWhatsapp(c.whatsapp);
    setFormInstagram(c.instagram || '');
    setFormDataNascimento(c.dataNascimento || '');
    setFormGenero(c.genero || 'FEMININO');
  };

  // Salvar Novo Cliente
  const handleSalvarNovo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      alert('Preencha o nome da cliente.');
      return;
    }

    const novo: Cliente = {
      id: 'cli-' + Date.now(),
      nome: formNome.trim(),
      referencia: formReferencia.trim() || undefined,
      whatsapp: cleanPhone(formWhatsapp),
      instagram: formInstagram.trim() || undefined,
      dataNascimento: formDataNascimento || undefined,
      genero: formGenero,
      totalComprado: 0,
    };

    onAdicionarCliente(novo);
    setModalNovo(false);
  };

  // Salvar Edição
  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteEditando || !formNome.trim()) return;

    const atualizado: Cliente = {
      ...clienteEditando,
      nome: formNome.trim(),
      referencia: formReferencia.trim() || undefined,
      whatsapp: cleanPhone(formWhatsapp),
      instagram: formInstagram.trim() || undefined,
      dataNascimento: formDataNascimento || undefined,
      genero: formGenero,
    };

    onAtualizarCliente(atualizado);
    setClienteEditando(null);

    // Se estiver na tela de detalhes, atualiza ela também
    if (clienteDetalhes?.id === atualizado.id) {
      setClienteDetalhes(atualizado);
    }
  };

  // Excluir Cliente
  const handleExcluir = (id: string, nome: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Deseja realmente excluir ${nome} da sua lista de clientes?`)) {
      onExcluirCliente(id);
      if (clienteDetalhes?.id === id) {
        setClienteDetalhes(null);
      }
    }
  };

  // Filtragem e Busca
  const clientesFiltrados = clientes
    .filter(cli => {
      const termo = busca.toLowerCase().trim();
      const matchBusca =
        !termo ||
        cli.nome.toLowerCase().includes(termo) ||
        (cli.referencia && cli.referencia.toLowerCase().includes(termo)) ||
        cli.whatsapp.includes(termo);

      if (!matchBusca) return false;

      if (filtroGenero === 'MULHERES') return cli.genero === 'FEMININO';
      if (filtroGenero === 'HOMENS') return cli.genero === 'MASCULINO';
      if (filtroGenero === 'NIVER_MES') {
        if (!cli.dataNascimento) return false;
        return (
          cli.dataNascimento.includes(`-${mesAtual}-`) ||
          cli.dataNascimento.endsWith(`-${mesAtual}`)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (ordenacao === 'NOME') {
        return a.nome.localeCompare(b.nome);
      }
      if (ordenacao === 'VALOR') {
        const totalA = vendas.filter(v => v.clienteId === a.id).reduce((s, v) => s + v.total, 0);
        const totalB = vendas.filter(v => v.clienteId === b.id).reduce((s, v) => s + v.total, 0);
        return totalB - totalA;
      }
      if (ordenacao === 'NIVER') {
        return (a.dataNascimento || '9999').localeCompare(b.dataNascimento || '9999');
      }
      return 0;
    });

  // Calcular estatísticas por cliente
  const obterResumoFinanceiroCliente = (clienteId: string) => {
    const vendasCli = vendas.filter(v => v.clienteId === clienteId);
    const cobrancasCli = cobrancas.filter(c => c.clienteId === clienteId);
    const totalGasto = vendasCli.reduce((sum, v) => sum + v.total, 0);
    const pendenteEmAberto = cobrancasCli
      .filter(c => c.status !== 'PAGO')
      .reduce((sum, c) => sum + c.valor, 0);

    return {
      totalVendas: vendasCli.length,
      totalGasto,
      pendenteEmAberto,
      vendas: vendasCli,
      cobrancas: cobrancasCli,
    };
  };

  return (
    <div className="space-y-4 text-stone-800">
      {/* Topo / Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-radiant-pink fill-radiant-pink" />
            Minhas Clientes ({clientes.length})
          </h2>
          <p className="text-xs text-stone-500">Histórico de compras, WhatsApp e referências</p>
        </div>

        <button
          onClick={abrirModalNovo}
          className="bg-radiant-pink hover:bg-rose-600 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-sm flex items-center gap-1.5 transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          + Nova
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar cliente por nome, referência ou WhatsApp..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full text-xs bg-white border border-stone-200 rounded-2xl px-3 py-2.5 pl-8 focus:outline-none focus:border-radiant-pink shadow-sm"
        />
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
        {busca && (
          <button
            onClick={() => setBusca('')}
            className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros Rápidos */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-semibold">
        <button
          onClick={() => setFiltroGenero('TODOS')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition ${
            filtroGenero === 'TODOS'
              ? 'bg-stone-900 text-white font-bold'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Todas ({clientes.length})
        </button>

        <button
          onClick={() => setFiltroGenero('NIVER_MES')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
            filtroGenero === 'NIVER_MES'
              ? 'bg-radiant-pink text-white font-bold'
              : 'bg-rose-50 text-radiant-pink hover:bg-rose-100'
          }`}
        >
          🎂 Aniversariantes do Mês
        </button>

        <button
          onClick={() => setFiltroGenero('MULHERES')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition ${
            filtroGenero === 'MULHERES'
              ? 'bg-stone-900 text-white font-bold'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          👩 Feminino
        </button>

        <button
          onClick={() => setFiltroGenero('HOMENS')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition ${
            filtroGenero === 'HOMENS'
              ? 'bg-stone-900 text-white font-bold'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          👨 Masculino
        </button>
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-2.5">
        {clientesFiltrados.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center space-y-2 border border-stone-200/80 shadow-xs">
            <p className="text-3xl">👥</p>
            <p className="font-bold text-stone-700 text-sm">Nenhuma cliente encontrada</p>
            <p className="text-xs text-stone-400">Tente buscar por outro nome ou adicione uma nova.</p>
            <button
              onClick={abrirModalNovo}
              className="mt-2 text-xs font-bold text-radiant-pink hover:underline"
            >
              + Cadastrar agora
            </button>
          </div>
        ) : (
          clientesFiltrados.map(cli => {
            const resumo = obterResumoFinanceiroCliente(cli.id);
            const ehNiverMes =
              cli.dataNascimento &&
              (cli.dataNascimento.includes(`-${mesAtual}-`) || cli.dataNascimento.endsWith(`-${mesAtual}`));
            const phoneClean = cleanPhone(cli.whatsapp);

            return (
              <div
                key={cli.id}
                onClick={() => setClienteDetalhes(cli)}
                className="bg-white p-3.5 rounded-3xl border border-stone-200/70 shadow-xs hover:border-radiant-pink/40 hover:shadow-sm transition cursor-pointer flex flex-col gap-2 relative"
              >
                {/* Linha Superior: Nome, Referência e Badge Aniversário */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-sm text-stone-900">{cli.nome}</h3>
                      {ehNiverMes && (
                        <span className="text-[10px] font-bold bg-rose-100 text-radiant-pink px-2 py-0.5 rounded-full flex items-center gap-1">
                          🎂 Aniversário no mês!
                        </span>
                      )}
                    </div>

                    {cli.referencia ? (
                      <p className="text-xs text-radiant-pink font-semibold mt-0.5 truncate">
                        🏷️ {cli.referencia}
                      </p>
                    ) : (
                      <p className="text-[11px] text-stone-400 italic mt-0.5">Sem referência cadastrada</p>
                    )}
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <a
                      href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
                        `Oi, ${extrairPrimeiroNome(cli.nome)}! ✨ Tudo bem?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Chamar no WhatsApp"
                      className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 active:scale-90 flex items-center justify-center transition border border-emerald-200/60"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={e => abrirModalEdicao(cli, e)}
                      title="Editar Cliente"
                      className="w-8 h-8 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 active:scale-90 flex items-center justify-center transition border border-stone-200/60"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={e => handleExcluir(cli.id, cli.nome, e)}
                      title="Excluir Cliente"
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 active:scale-90 flex items-center justify-center transition border border-rose-200/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Linha Inferior: Telefone e Resumo Financeiro */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                  <span className="text-stone-500 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3 text-stone-400" />
                    {cli.whatsapp}
                  </span>

                  <div className="flex items-center gap-3">
                    {resumo.pendenteEmAberto > 0 && (
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                        Deve: {formatCurrency(resumo.pendenteEmAberto)}
                      </span>
                    )}

                    <span className="font-extrabold text-stone-700">
                      Total: {formatCurrency(resumo.totalGasto)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: CADASTRAR OU EDITAR CLIENTE */}
      {(modalNovo || clienteEditando) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={clienteEditando ? handleSalvarEdicao : handleSalvarNovo}
            className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-1 border-b border-stone-100">
              <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-radiant-pink" />
                {clienteEditando ? 'Editar Cliente' : 'Cadastrar Nova Cliente'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalNovo(false);
                  setClienteEditando(null);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luana Martins"
                  value={formNome}
                  onChange={e => setFormNome(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-radiant-pink"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Referência / Onde Conhece
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cabeleireira do Salão Bella, Mercado JJR"
                  value={formReferencia}
                  onChange={e => setFormReferencia(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-radiant-pink"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Ajuda você a lembrar de quem é sem misturar nomes iguais.
                </p>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">WhatsApp (com DDD) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 19998877665"
                  value={formWhatsapp}
                  onChange={e => setFormWhatsapp(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-radiant-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Data Aniversário</label>
                  <input
                    type="date"
                    value={formDataNascimento}
                    onChange={e => setFormDataNascimento(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:border-radiant-pink"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Gênero</label>
                  <select
                    value={formGenero}
                    onChange={e => setFormGenero(e.target.value as GeneroCliente)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs focus:outline-none focus:border-radiant-pink"
                  >
                    <option value="FEMININO">Feminino</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Instagram (opcional)</label>
                <input
                  type="text"
                  placeholder="@cliente"
                  value={formInstagram}
                  onChange={e => setFormInstagram(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-medium focus:outline-none focus:border-radiant-pink"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalNovo(false);
                  setClienteEditando(null);
                }}
                className="w-1/3 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="w-2/3 py-2.5 bg-radiant-pink hover:bg-rose-600 active:scale-95 text-white font-bold rounded-xl text-xs shadow-md shadow-radiant-pink/30 flex items-center justify-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" />
                {clienteEditando ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: DETALHES COMPLETOS DA CLIENTE */}
      {clienteDetalhes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Topo do Modal */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <h3 className="font-black text-base text-stone-900">{clienteDetalhes.nome}</h3>
                {clienteDetalhes.referencia && (
                  <p className="text-xs text-radiant-pink font-bold">🏷️ {clienteDetalhes.referencia}</p>
                )}
              </div>
              <button
                onClick={() => setClienteDetalhes(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações de Contato */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">WhatsApp:</span>
                <span className="font-mono font-bold text-stone-800">{clienteDetalhes.whatsapp}</span>
              </div>
              {clienteDetalhes.dataNascimento && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Aniversário:</span>
                  <span className="font-bold text-stone-800">
                    🎂 {formatDateBR(clienteDetalhes.dataNascimento)}
                  </span>
                </div>
              )}
              {clienteDetalhes.instagram && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Instagram:</span>
                  <span className="text-radiant-pink font-bold">{clienteDetalhes.instagram}</span>
                </div>
              )}
            </div>

            {/* Resumo Financeiro */}
            {(() => {
              const res = obterResumoFinanceiroCliente(clienteDetalhes.id);
              return (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200/70">
                    <p className="text-[10px] text-emerald-700 font-bold">Total Comprado</p>
                    <p className="text-sm font-black text-emerald-800 mt-0.5">
                      {formatCurrency(res.totalGasto)}
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">{res.totalVendas} pedidos</p>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/70">
                    <p className="text-[10px] text-amber-700 font-bold">Pendente em Aberto</p>
                    <p className="text-sm font-black text-amber-800 mt-0.5">
                      {formatCurrency(res.pendenteEmAberto)}
                    </p>
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      {res.pendenteEmAberto > 0 ? 'Cobrança ativa' : 'Em dia! ✨'}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Histórico Recente de Compras */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 max-h-48 text-xs">
              <label className="font-bold text-stone-700 block text-[11px]">Histórico de Pedidos:</label>
              {(() => {
                const res = obterResumoFinanceiroCliente(clienteDetalhes.id);
                if (res.vendas.length === 0) {
                  return (
                    <p className="text-stone-400 text-center py-4 text-xs italic">
                      Nenhum pedido registrado para esta cliente ainda.
                    </p>
                  );
                }

                return res.vendas.map(v => (
                  <div key={v.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-radiant-pink text-[11px]">#{v.id}</span>
                      <span className="text-[10px] text-stone-400">{formatDateBR(v.data)}</span>
                    </div>
                    <p className="text-[11px] text-stone-700 truncate">
                      {v.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')}
                    </p>
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-stone-200/60">
                      <span className="text-stone-500">{v.formaPagamento === 'PRAZO' ? 'A Prazo' : 'À Vista'}</span>
                      <span className="font-black text-stone-900">{formatCurrency(v.total)}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Ações Inferiores */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => abrirModalEdicao(clienteDetalhes)}
                className="w-1/2 py-2.5 rounded-2xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition flex items-center justify-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar Dados
              </button>

              <a
                href={`https://wa.me/${cleanPhone(clienteDetalhes.whatsapp)}?text=${encodeURIComponent(
                  `Oi, ${extrairPrimeiroNome(clienteDetalhes.nome)}! ✨ Tudo bem?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Abrir Whats
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
