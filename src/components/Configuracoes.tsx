import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, RefreshCw, MessageCircle, Heart, Tag, Layers, Users, Gift, Plus, Trash2, Send, Cloud, Smartphone, Database, CheckCircle2, Lock, Fingerprint, KeyRound, ShieldCheck } from 'lucide-react';
import { ConfiguracoesLoja, Categoria, Marca, Cliente } from '../types';
import { INITIAL_CONFIG } from '../services/storage';
import { cleanPhone, formatCurrency, extrairPrimeiroNome } from '../utils/whatsapp';
import { biometriaService } from '../utils/biometria';

interface ConfiguracoesProps {
  config: ConfiguracoesLoja;
  categorias: Categoria[];
  marcas: Marca[];
  clientes: Cliente[];
  onSalvarConfig: (config: ConfiguracoesLoja) => void;
  onSalvarCategorias: (categorias: Categoria[]) => void;
  onSalvarMarcas: (marcas: Marca[]) => void;
  onVoltar: () => void;
  onSincronizarNuvem?: () => Promise<{ sucesso: boolean; mensagem: string }>;
  onBloquear?: () => void;
}

export const Configuracoes: React.FC<ConfiguracoesProps> = ({
  config,
  categorias,
  marcas,
  clientes,
  onSalvarConfig,
  onSalvarCategorias,
  onSalvarMarcas,
  onVoltar,
  onSincronizarNuvem,
  onBloquear,
}) => {
  const [tabConfig, setTabConfig] = useState<'CAMPANHAS' | 'NUVEM' | 'SEGURANCA' | 'CATEGORIAS' | 'MENSAGENS' | 'PIX'>('CAMPANHAS');
  const [sincronizando, setSincronizando] = useState(false);
  const [msgSync, setMsgSync] = useState<string | null>(null);

  // Estados de Segurança (PIN, Biometria, Senha Mestra)
  const [biometriaDisponivel, setBiometriaDisponivel] = useState(false);
  const [biometriaAtiva, setBiometriaAtiva] = useState(false);
  const [novoPinForm, setNovoPinForm] = useState('');
  const [msgPin, setMsgPin] = useState<string | null>(null);
  const [novaSenhaMestraForm, setNovaSenhaMestraForm] = useState('');
  const [senhaMestraAtualForm, setSenhaMestraAtualForm] = useState('');
  const [msgSenhaMestra, setMsgSenhaMestra] = useState<string | null>(null);

  useEffect(() => {
    biometriaService.isDisponivel().then(disp => {
      setBiometriaDisponivel(disp);
      setBiometriaAtiva(biometriaService.isAtivada());
    });
  }, []);

  const handleToggleBiometria = async () => {
    if (biometriaAtiva) {
      biometriaService.desativar();
      setBiometriaAtiva(false);
    } else {
      const res = await biometriaService.ativar();
      if (res.sucesso) {
        setBiometriaAtiva(true);
      } else {
        alert(res.mensagem);
      }
    }
  };

  const handleSalvarNovoPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoPinForm.length === 4 && /^\d{4}$/.test(novoPinForm)) {
      localStorage.setItem('radiant_pin_mestre', novoPinForm);
      setMsgPin('PIN atualizado com sucesso!');
      setNovoPinForm('');
      setTimeout(() => setMsgPin(null), 3000);
    } else {
      setMsgPin('O PIN deve conter exatamente 4 números.');
    }
  };

  const handleSalvarNovaSenhaMestra = (e: React.FormEvent) => {
    e.preventDefault();
    const senhaAtual = localStorage.getItem('radiant_senha_mestra') || 'Maraccini26@';

    if (senhaMestraAtualForm !== senhaAtual) {
      setMsgSenhaMestra('Senha atual incorreta.');
      return;
    }

    if (novaSenhaMestraForm.length < 6) {
      setMsgSenhaMestra('A nova senha mestra deve ter no mínimo 6 caracteres.');
      return;
    }

    localStorage.setItem('radiant_senha_mestra', novaSenhaMestraForm);
    setMsgSenhaMestra('Senha mestra atualizada com sucesso!');
    setNovaSenhaMestraForm('');
    setSenhaMestraAtualForm('');
    setTimeout(() => setMsgSenhaMestra(null), 3000);
  };

  // Dados de Configuração
  const [formData, setFormData] = useState<ConfiguracoesLoja>(config);
  const [salvo, setSalvo] = useState(false);

  // Categorias & Marcas locais
  const [listaCategorias, setListaCategorias] = useState<Categoria[]>(categorias);
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novaCatEmoji, setNovaCatEmoji] = useState('💄');

  const [listaMarcas, setListaMarcas] = useState<Marca[]>(marcas);
  const [novaMarcaNome, setNovaMarcaNome] = useState('');

  // Estados da Central de Campanhas WhatsApp
  const [filtroPublico, setFiltroPublico] = useState<'NIVER' | 'MULHERES' | 'HOMENS' | 'TODOS' | 'ESPECIFICO'>('NIVER');
  const [clienteEspecificoId, setClienteEspecificoId] = useState<string>(clientes[0]?.id || '');
  const [tipoMensagem, setTipoMensagem] = useState<'NIVER' | 'DATAS' | 'AGRADECIMENTO' | 'CUSTOM'>('NIVER');
  const [textoPersonalizado, setTextoPersonalizado] = useState('');

  // Salvar Config Geral
  const handleSalvarConfigGeral = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarConfig(formData);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const restaurarPadrao = () => {
    if (confirm('Deseja restaurar as mensagens para o modelo padrão da Radiant Make?')) {
      setFormData(INITIAL_CONFIG);
      onSalvarConfig(INITIAL_CONFIG);
    }
  };

  // Gerenciamento de Categorias
  const handleAdicionarCategoria = () => {
    if (!novaCatNome.trim()) return;
    const nova: Categoria = {
      id: 'cat-' + Date.now(),
      nome: novaCatNome.trim(),
      emoji: novaCatEmoji || '✨',
    };
    const atualizadas = [...listaCategorias, nova];
    setListaCategorias(atualizadas);
    onSalvarCategorias(atualizadas);
    setNovaCatNome('');
  };

  const handleRemoverCategoria = (id: string) => {
    if (confirm('Deseja remover esta categoria?')) {
      const atualizadas = listaCategorias.filter(c => c.id !== id);
      setListaCategorias(atualizadas);
      onSalvarCategorias(atualizadas);
    }
  };

  // Gerenciamento de Marcas
  const handleAdicionarMarca = () => {
    if (!novaMarcaNome.trim()) return;
    const nova: Marca = {
      id: 'marca-' + Date.now(),
      nome: novaMarcaNome.trim(),
    };
    const atualizadas = [...listaMarcas, nova];
    setListaMarcas(atualizadas);
    onSalvarMarcas(atualizadas);
    setNovaMarcaNome('');
  };

  const handleRemoverMarca = (id: string) => {
    if (confirm('Deseja remover esta marca?')) {
      const atualizadas = listaMarcas.filter(m => m.id !== id);
      setListaMarcas(atualizadas);
      onSalvarMarcas(atualizadas);
    }
  };

  // Filtragem de clientes para a Campanha
  const mesAtual = new Date().getMonth() + 1; // 1-12
  const clientesFiltradosCampanha = clientes.filter(c => {
    if (filtroPublico === 'TODOS') return true;
    if (filtroPublico === 'MULHERES') return c.genero === 'FEMININO';
    if (filtroPublico === 'HOMENS') return c.genero === 'MASCULINO';
    if (filtroPublico === 'ESPECIFICO') return c.id === clienteEspecificoId;
    if (filtroPublico === 'NIVER') {
      if (!c.dataNascimento) return false;
      const partes = c.dataNascimento.split('-');
      // YYYY-MM-DD ou MM-DD
      const mesNiver = partes.length === 3 ? parseInt(partes[1], 10) : parseInt(partes[0], 10);
      return mesNiver === mesAtual;
    }
    return true;
  });

  // Gerar Link WhatsApp para Campanha
  const getLinkCampanha = (cliente: Cliente): string => {
    const phone = cleanPhone(cliente.whatsapp);
    const primeiroNome = extrairPrimeiroNome(cliente.nome);

    let template = '';
    if (tipoMensagem === 'NIVER') {
      template = formData.mensagemAniversario || INITIAL_CONFIG.mensagemAniversario;
    } else if (tipoMensagem === 'DATAS') {
      template = formData.mensagemDataComemorativa || INITIAL_CONFIG.mensagemDataComemorativa;
    } else if (tipoMensagem === 'AGRADECIMENTO') {
      template = formData.mensagemAgradecimento || INITIAL_CONFIG.mensagemAgradecimento;
    } else {
      template = textoPersonalizado || 'Oi, {nome}! ✨ Tudo bem?';
    }

    const textoFinal = template
      .replace('{nome}', primeiroNome)
      .replace('{cupom}', formData.cupomAniversarioPadrao || 'NIVER10')
      .replace('{chavePix}', formData.chavePix)
      .replace('{pedidoId}', 'Geral')
      .replace('{itens}', 'seus produtos favoritos')
      .replace('{valor}', '0,00');

    return `https://wa.me/${phone}?text=${encodeURIComponent(textoFinal)}`;
  };

  return (
    <div className="space-y-4">
      {/* Topo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-radiant-pink" />
            Configurações & Ferramentas
          </h2>
          <p className="text-xs text-stone-500">Campanhas, categorias, marcas e mensagens</p>
        </div>
        <button
          onClick={onVoltar}
          className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
        >
          Voltar
        </button>
      </div>

      {/* Abas Superiores de Configuração */}
      <div className="flex gap-1 bg-stone-200/70 p-1 rounded-2xl text-[11px] font-bold text-stone-600 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setTabConfig('CAMPANHAS')}
          className={`flex-1 min-w-[76px] py-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
            tabConfig === 'CAMPANHAS'
              ? 'bg-radiant-pink text-white shadow-sm font-extrabold'
              : 'hover:text-stone-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Campanhas
        </button>

        <button
          onClick={() => setTabConfig('NUVEM')}
          className={`flex-1 min-w-[70px] py-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
            tabConfig === 'NUVEM'
              ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
              : 'hover:text-stone-900'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          Nuvem
        </button>

        <button
          onClick={() => setTabConfig('SEGURANCA')}
          className={`flex-1 min-w-[80px] py-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
            tabConfig === 'SEGURANCA'
              ? 'bg-stone-900 text-white shadow-sm font-extrabold'
              : 'hover:text-stone-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-amber-300" />
          Segurança
        </button>

        <button
          onClick={() => setTabConfig('CATEGORIAS')}
          className={`flex-1 min-w-[76px] py-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
            tabConfig === 'CATEGORIAS'
              ? 'bg-white text-stone-900 shadow-sm font-extrabold'
              : 'hover:text-stone-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-radiant-pink" />
          Categorias
        </button>

        <button
          onClick={() => setTabConfig('MENSAGENS')}
          className={`flex-1 min-w-[70px] py-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
            tabConfig === 'MENSAGENS'
              ? 'bg-white text-stone-900 shadow-sm font-extrabold'
              : 'hover:text-stone-900'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-pink-600" />
          Textos
        </button>

        <button
          onClick={() => setTabConfig('PIX')}
          className={`flex-1 min-w-[50px] py-1.5 rounded-xl transition flex items-center justify-center gap-1 ${
            tabConfig === 'PIX'
              ? 'bg-white text-stone-900 shadow-sm font-extrabold'
              : 'hover:text-stone-900'
          }`}
        >
          Pix
        </button>
      </div>

      {/* ABA 1: CENTRAL DE CAMPANHAS E NOTIFICAÇÕES WHATSAPP */}
      {tabConfig === 'CAMPANHAS' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-rose-500 to-radiant-pink text-white p-4 rounded-3xl shadow-md space-y-1">
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-200" />
              Disparador de Campanhas & Aniversários
            </h3>
            <p className="text-[11px] text-pink-100">
              Escolha para quem quer mandar mensagem e abra o WhatsApp de cada cliente com 1 toque!
            </p>
          </div>

          {/* Filtro do Público */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3 text-xs">
            <label className="font-bold text-stone-800 block">1. Para quem você quer enviar?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFiltroPublico('NIVER')}
                className={`p-2.5 rounded-2xl border text-left font-bold transition flex items-center gap-2 ${
                  filtroPublico === 'NIVER'
                    ? 'border-2 border-radiant-pink bg-rose-50 text-radiant-pink shadow-xs'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="text-base">🎂</span>
                <div>
                  <p>Aniversariantes do Mês</p>
                  <span className="text-[10px] text-stone-400 font-normal">Novembro</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFiltroPublico('MULHERES')}
                className={`p-2.5 rounded-2xl border text-left font-bold transition flex items-center gap-2 ${
                  filtroPublico === 'MULHERES'
                    ? 'border-2 border-radiant-pink bg-rose-50 text-radiant-pink shadow-xs'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="text-base">👩</span>
                <div>
                  <p>Apenas Mulheres</p>
                  <span className="text-[10px] text-stone-400 font-normal">Makes & Skincare</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFiltroPublico('HOMENS')}
                className={`p-2.5 rounded-2xl border text-left font-bold transition flex items-center gap-2 ${
                  filtroPublico === 'HOMENS'
                    ? 'border-2 border-radiant-pink bg-rose-50 text-radiant-pink shadow-xs'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="text-base">👨</span>
                <div>
                  <p>Apenas Homens</p>
                  <span className="text-[10px] text-stone-400 font-normal">Perfumes & Presentes</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFiltroPublico('TODOS')}
                className={`p-2.5 rounded-2xl border text-left font-bold transition flex items-center gap-2 ${
                  filtroPublico === 'TODOS'
                    ? 'border-2 border-radiant-pink bg-rose-50 text-radiant-pink shadow-xs'
                    : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="text-base">👥</span>
                <div>
                  <p>Todos os Clientes</p>
                  <span className="text-[10px] text-stone-400 font-normal">Base completa</span>
                </div>
              </button>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setFiltroPublico('ESPECIFICO')}
                className={`w-full py-2 px-3 rounded-xl border text-center font-bold text-xs transition ${
                  filtroPublico === 'ESPECIFICO'
                    ? 'border-2 border-radiant-pink bg-rose-50 text-radiant-pink'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                🔍 Escolher uma cliente específica
              </button>

              {filtroPublico === 'ESPECIFICO' && (
                <div className="mt-2">
                  <select
                    value={clienteEspecificoId}
                    onChange={e => setClienteEspecificoId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-radiant-pink"
                  >
                    {clientes.map(cli => (
                      <option key={cli.id} value={cli.id}>
                        {cli.nome} {cli.referencia ? `(${cli.referencia})` : ''} - {cli.whatsapp}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Escolha do Modelo da Mensagem */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-2.5 text-xs">
            <label className="font-bold text-stone-800 block">2. Qual mensagem enviar?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoMensagem('NIVER')}
                className={`p-2 rounded-xl border text-xs font-bold transition ${
                  tipoMensagem === 'NIVER'
                    ? 'bg-radiant-pink text-white border-radiant-pink'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                🎂 Parabéns + Cupom
              </button>

              <button
                type="button"
                onClick={() => setTipoMensagem('DATAS')}
                className={`p-2 rounded-xl border text-xs font-bold transition ${
                  tipoMensagem === 'DATAS'
                    ? 'bg-radiant-pink text-white border-radiant-pink'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                🌸 Novidades & Mimo
              </button>
            </div>
          </div>

          {/* Lista de Contatos Elegíveis para Disparo */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-stone-800">
                Clientes Elegíveis ({clientesFiltradosCampanha.length})
              </h4>
              <span className="text-[10px] text-stone-400">Toque no botão para enviar no Whats</span>
            </div>

            {clientesFiltradosCampanha.length === 0 ? (
              <p className="text-center text-xs text-stone-400 py-4">
                Nenhuma cliente encontrada para este critério.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                {clientesFiltradosCampanha.map(cli => {
                  const linkWhats = getLinkCampanha(cli);

                  return (
                    <div
                      key={cli.id}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-stone-900">{cli.nome}</p>
                          {cli.dataNascimento && (
                            <span className="text-[10px] bg-rose-100 text-radiant-pink font-semibold px-1.5 py-0.2 rounded-md">
                              🎂 {cli.dataNascimento}
                            </span>
                          )}
                        </div>
                        {cli.referencia && (
                          <p className="text-[10px] text-radiant-pink font-medium truncate max-w-[170px]">
                            {cli.referencia}
                          </p>
                        )}
                        <p className="text-[10px] text-stone-400">{cli.whatsapp}</p>
                      </div>

                      <a
                        href={linkWhats}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-sm transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Disparar
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: NUVEM & SINCRONIZAÇÃO SUPABASE */}
      {tabConfig === 'NUVEM' && (
        <div className="space-y-4 text-xs">
          {/* Card Status Conexão */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-3xl shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-emerald-200" />
                Sincronização em Nuvem (Supabase)
              </h3>
              <span className="bg-emerald-500/80 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse"></span>
                Ativo & Conectado
              </span>
            </div>
            <p className="text-[11px] text-emerald-50 leading-relaxed">
              Seus dados agora são sincronizados no banco de dados seguro do Supabase. Você pode usar no computador e no celular ao mesmo tempo!
            </p>
          </div>

          {/* Botão de Sincronização Manual */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Sincronizar Banco Agora
                </h4>
                <p className="text-[11px] text-stone-400">
                  {localStorage.getItem('radiant_last_sync')
                    ? `Última sincronização: hoje às ${localStorage.getItem('radiant_last_sync')}`
                    : 'Pronto para sincronizar'}
                </p>
              </div>

              <button
                type="button"
                disabled={sincronizando}
                onClick={async () => {
                  if (onSincronizarNuvem) {
                    setSincronizando(true);
                    setMsgSync(null);
                    try {
                      const res = await onSincronizarNuvem();
                      setMsgSync(res.mensagem);
                    } catch (err: any) {
                      setMsgSync('Erro: ' + (err.message || 'Falha'));
                    } finally {
                      setSincronizando(false);
                    }
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold px-4 py-2.5 rounded-2xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`} />
                {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </div>

            {msgSync && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{msgSync}</span>
              </div>
            )}
          </div>

          {/* Detalhes Técnicos do Banco */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-2.5">
            <h4 className="font-bold text-stone-900 text-xs">Informações da Conexão</h4>

            <div className="p-2.5 bg-stone-50 rounded-xl space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Projeto Supabase:</span>
                <span className="font-mono font-bold text-stone-800">filsokpyqndkbskwbscn</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Banco de Dados:</span>
                <span className="font-bold text-emerald-600">PostgreSQL (7 tabelas ativas)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Modo Offline:</span>
                <span className="font-bold text-stone-700">Ativo (Cache Local Instantâneo)</span>
              </div>
            </div>
          </div>

          {/* Dica: Como instalar como App no Celular */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-2.5">
            <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-radiant-pink" />
              Como instalar como Aplicativo no Celular
            </h4>

            <div className="space-y-2 text-[11px] text-stone-600">
              <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100/80">
                <p className="font-bold text-radiant-pink mb-0.5">📱 No iPhone (iOS):</p>
                <p>Abra o link no navegador <b>Safari</b>, toque no botão de <b>Compartilhar</b> (ícone do quadrado com a seta para cima) e selecione <b>"Adicionar à Tela de Início"</b>.</p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80">
                <p className="font-bold text-stone-800 mb-0.5">🤖 No Android:</p>
                <p>Abra o link no <b>Google Chrome</b>, toque nos <b>3 pontinhos</b> no canto superior direito e selecione <b>"Instalar aplicativo"</b> ou <b>"Adicionar à tela inicial"</b>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA: SEGURANÇA, BIOMETRIA & SENHAS */}
      {tabConfig === 'SEGURANCA' && (
        <div className="space-y-4 text-xs">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-4 rounded-3xl shadow-md space-y-1.5 border border-stone-700">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Segurança & Bloqueio do App
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                Ativo
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              Controle quem pode acessar o sistema da loja através de Biometria (Face ID/Digital), PIN de 4 dígitos e Senha Mestra.
            </p>
          </div>

          {/* 1. Desbloqueio por Biometria / Celular */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                  <Fingerprint className="w-4 h-4 text-radiant-pink" />
                  Desbloqueio com Biometria
                </h4>
                <p className="text-[11px] text-stone-400">
                  {biometriaDisponivel
                    ? 'Desbloqueie pelo Face ID, Touch ID ou Digital do celular'
                    : 'Aparelho atual não possui leitor biométrico compatível'}
                </p>
              </div>

              {biometriaDisponivel && (
                <button
                  type="button"
                  onClick={handleToggleBiometria}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition shadow-xs ${
                    biometriaAtiva
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {biometriaAtiva ? '✓ Ativada' : 'Ativar'}
                </button>
              )}
            </div>
          </div>

          {/* 2. Alterar PIN de 4 Dígitos */}
          <form onSubmit={handleSalvarNovoPin} className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                <Lock className="w-4 h-4 text-radiant-pink" />
                PIN de Acesso Rápido (4 dígitos)
              </h4>
              <p className="text-[11px] text-stone-400">
                PIN atual padrão: <span className="font-mono font-bold text-stone-700">{localStorage.getItem('radiant_pin_mestre') || '2626'}</span>
              </p>
            </div>

            {msgPin && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {msgPin}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                value={novoPinForm}
                onChange={e => setNovoPinForm(e.target.value.replace(/\D/g, ''))}
                placeholder="Novo PIN (ex: 1234)"
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold tracking-widest text-center text-sm focus:outline-none focus:border-radiant-pink"
              />
              <button
                type="submit"
                className="bg-radiant-pink hover:bg-rose-600 active:scale-95 text-white font-bold px-4 rounded-xl shadow-xs transition"
              >
                Salvar PIN
              </button>
            </div>
          </form>

          {/* 3. Alterar Senha Mestra */}
          <form onSubmit={handleSalvarNovaSenhaMestra} className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
            <div>
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                <KeyRound className="w-4 h-4 text-amber-500" />
                Senha Mestra de Administrador
              </h4>
              <p className="text-[11px] text-stone-400">
                Usada para emergências ou caso você esqueça o PIN
              </p>
            </div>

            {msgSenhaMestra && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {msgSenhaMestra}
              </div>
            )}

            <div className="space-y-2">
              <div>
                <label className="block text-stone-500 text-[10px] font-bold mb-0.5">Senha Mestra Atual</label>
                <input
                  type="password"
                  value={senhaMestraAtualForm}
                  onChange={e => setSenhaMestraAtualForm(e.target.value)}
                  placeholder="Senha atual (ex: Maraccini26@)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              <div>
                <label className="block text-stone-500 text-[10px] font-bold mb-0.5">Nova Senha Mestra</label>
                <input
                  type="password"
                  value={novaSenhaMestraForm}
                  onChange={e => setNovaSenhaMestraForm(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-2 rounded-xl transition"
              >
                Atualizar Senha Mestra
              </button>
            </div>
          </form>

          {/* 4. Bloquear Agora */}
          {onBloquear && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onBloquear}
                className="w-full bg-rose-100/70 hover:bg-rose-200 text-rose-700 font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 border border-rose-200/80 active:scale-95"
              >
                <Lock className="w-4 h-4" />
                Bloquear Aplicativo Agora (Testar Tela de Bloqueio)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: CATEGORIAS & MARCAS */}
      {tabConfig === 'CATEGORIAS' && (
        <div className="space-y-4">
          {/* Categorias com Emoji */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-radiant-pink" />
                Categorias de Produtos ({listaCategorias.length})
              </h3>
            </div>
            <p className="text-[11px] text-stone-500">
              O emoji da categoria é herdado automaticamente pelos produtos!
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Emoji (💄)"
                value={novaCatEmoji}
                onChange={e => setNovaCatEmoji(e.target.value)}
                className="w-16 bg-stone-50 border border-stone-200 rounded-xl p-2 text-center text-base focus:outline-none focus:border-radiant-pink"
              />
              <input
                type="text"
                placeholder="Nova Categoria..."
                value={novaCatNome}
                onChange={e => setNovaCatNome(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2 focus:outline-none focus:border-radiant-pink"
              />
              <button
                type="button"
                onClick={handleAdicionarCategoria}
                className="bg-radiant-pink hover:bg-rose-600 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pt-1">
              {listaCategorias.map(cat => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="font-bold text-stone-800">{cat.nome}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoverCategoria(cat.id)}
                    className="text-stone-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Marcas */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-radiant-pink" />
                Marcas Parceiras ({listaMarcas.length})
              </h3>
            </div>
            <p className="text-[11px] text-stone-500">
              Marcas facilitam a busca rápida na hora de registrar a venda.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome da Marca (ex: Boca Rosa)..."
                value={novaMarcaNome}
                onChange={e => setNovaMarcaNome(e.target.value)}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2 focus:outline-none focus:border-radiant-pink"
              />
              <button
                type="button"
                onClick={handleAdicionarMarca}
                className="bg-radiant-pink hover:bg-rose-600 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {listaMarcas.map(m => (
                <span
                  key={m.id}
                  className="bg-rose-50 border border-rose-200/90 text-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                >
                  {m.nome}
                  <button
                    type="button"
                    onClick={() => handleRemoverMarca(m.id)}
                    className="text-stone-400 hover:text-rose-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: TEXTOS DO WHATSAPP */}
      {tabConfig === 'MENSAGENS' && (
        <form onSubmit={handleSalvarConfigGeral} className="space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-800">Modelos de Mensagens</h3>
              <button
                type="button"
                onClick={restaurarPadrao}
                className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Padrão
              </button>
            </div>

            {/* Cupom Aniversário */}
            <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-200/80">
              <label className="block text-stone-800 font-bold mb-1">
                Cupom de Desconto de Aniversário
              </label>
              <input
                type="text"
                value={formData.cupomAniversarioPadrao || ''}
                onChange={e => setFormData({ ...formData, cupomAniversarioPadrao: e.target.value.toUpperCase() })}
                placeholder="Ex: NIVER10"
                className="w-full bg-white border border-stone-200 rounded-xl p-2 font-mono font-bold text-radiant-pink focus:outline-none focus:border-radiant-pink"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">
                1. Agradecimento de Venda (Pós-Venda)
              </label>
              <textarea
                rows={3}
                value={formData.mensagemAgradecimento}
                onChange={e => setFormData({ ...formData, mensagemAgradecimento: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">
                2. Mensagem de Aniversário (com cupom)
              </label>
              <textarea
                rows={3}
                value={formData.mensagemAniversario}
                onChange={e => setFormData({ ...formData, mensagemAniversario: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">
                3. Lembrete Amigável (Dia do Vencimento)
              </label>
              <textarea
                rows={3}
                value={formData.mensagemLembrete}
                onChange={e => setFormData({ ...formData, mensagemLembrete: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">
                4. Cobrança Delicada (Parcela Atrasada)
              </label>
              <textarea
                rows={3}
                value={formData.mensagemCobranca}
                onChange={e => setFormData({ ...formData, mensagemCobranca: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-semibold">
                5. Mensagem para Datas Comemorativas / Novidades
              </label>
              <textarea
                rows={3}
                value={formData.mensagemDataComemorativa}
                onChange={e => setFormData({ ...formData, mensagemDataComemorativa: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-radiant-pink to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold py-3.5 rounded-3xl shadow-lg shadow-radiant-pink/30 flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            {salvo ? <Check className="w-5 h-5 text-emerald-300" /> : <Save className="w-5 h-5" />}
            {salvo ? 'Mensagens Salvas!' : 'Salvar Textos'}
          </button>
        </form>
      )}

      {/* ABA 4: PIX E DADOS DA LOJA */}
      {tabConfig === 'PIX' && (
        <form onSubmit={handleSalvarConfigGeral} className="space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 space-y-3">
            <h3 className="font-bold text-xs text-stone-800">Dados do Pix & Contato</h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Sua Chave Pix</label>
                <input
                  type="text"
                  value={formData.chavePix}
                  onChange={e => setFormData({ ...formData, chavePix: e.target.value })}
                  placeholder="Ex: 19999999999 ou seu CPF/email"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-900 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Tipo da Chave</label>
                  <select
                    value={formData.tipoChavePix}
                    onChange={e => setFormData({ ...formData, tipoChavePix: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                  >
                    <option value="Celular">Celular</option>
                    <option value="CPF">CPF</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Chave Aleatória">Chave Aleatória</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">WhatsApp da Loja</label>
                  <input
                    type="text"
                    value={formData.whatsappLoja}
                    onChange={e => setFormData({ ...formData, whatsappLoja: e.target.value })}
                    placeholder="Ex: 19999999999"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-radiant-pink to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold py-3.5 rounded-3xl shadow-lg shadow-radiant-pink/30 flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            {salvo ? <Check className="w-5 h-5 text-emerald-300" /> : <Save className="w-5 h-5" />}
            {salvo ? 'Dados Salvos!' : 'Salvar Dados Pix'}
          </button>
        </form>
      )}
    </div>
  );
};
