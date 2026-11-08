import React, { useState, useRef } from 'react';
import { Plus, Sparkles, Package, AlertTriangle, Search, Tag, Layers, PackagePlus, Trash2, Archive, TrendingUp, Camera, X, Pencil } from 'lucide-react';
import { Produto, Categoria, Marca } from '../types';
import { formatCurrency } from '../utils/whatsapp';
import { comprimirImagem } from '../utils/image';

interface CatalogoProps {
  produtos: Produto[];
  categorias: Categoria[];
  marcas: Marca[];
  onAdicionarProduto: (produto: Produto) => void;
  onAtualizarProduto: (produto: Produto) => void;
  onAdicionarCategoria: (categoria: Categoria) => void;
  onAdicionarMarca: (marca: Marca) => void;
  onAbastecerProduto: (id: string, quantidade: number, novoCusto: number, novoPrecoVenda?: number) => void;
  onExcluirProduto: (id: string) => void;
  onAlternarStatusProduto: (id: string) => void;
  onAbrirConfiguracoes: () => void;
}

export const Catalogo: React.FC<CatalogoProps> = ({
  produtos,
  categorias,
  marcas,
  onAdicionarProduto,
  onAtualizarProduto,
  onAdicionarCategoria,
  onAdicionarMarca,
  onAbastecerProduto,
  onExcluirProduto,
  onAlternarStatusProduto,
  onAbrirConfiguracoes,
}) => {
  const [modalNovo, setModalNovo] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [abaStatus, setAbaStatus] = useState<'ATIVOS' | 'ARQUIVADOS'>('ATIVOS');

  // Modal de Abastecimento com Custo Médio Ponderado (CMP)
  const [produtoAbastecendo, setProdutoAbastecendo] = useState<Produto | null>(null);
  const [qtdAbastecer, setQtdAbastecer] = useState<string>('10');
  const [custoNovoLote, setCustoNovoLote] = useState<string>('');
  const [novoPrecoVendaSugerido, setNovoPrecoVendaSugerido] = useState<string>('');

  // Modal de Edição Completa de Produto
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCategoriaId, setEditCategoriaId] = useState('');
  const [editMarcaNome, setEditMarcaNome] = useState('');
  const [editPrecoVenda, setEditPrecoVenda] = useState('');
  const [editPrecoCusto, setEditPrecoCusto] = useState('');
  const [editEstoque, setEditEstoque] = useState('');
  const [editAlertaEstoque, setEditAlertaEstoque] = useState(true);
  const [editEstoqueMinimo, setEditEstoqueMinimo] = useState('1');
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [carregandoFotoEdit, setCarregandoFotoEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Submodais rápidos para cadastrar categoria ou marca na hora
  const [modalMiniCategoria, setModalMiniCategoria] = useState(false);
  const [novaCatNome, setNovaCatNome] = useState('');
  const [novaCatEmoji, setNovaCatEmoji] = useState('💄');

  const [modalMiniMarca, setModalMiniMarca] = useState(false);
  const [novaMarcaNome, setNovaMarcaNome] = useState('');

  // Form novo produto
  const [nome, setNome] = useState('');
  const [categoriaId, setCategoriaId] = useState<string>(categorias[0]?.id || '');
  const [marcaNome, setMarcaNome] = useState<string>(marcas[0]?.nome || '');
  const [precoVenda, setPrecoVenda] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [estoque, setEstoque] = useState('5');
  const [alertaEstoque, setAlertaEstoque] = useState(true);
  const [estoqueMinimo, setEstoqueMinimo] = useState('1');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload e compressão de foto no cadastro novo
  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCarregandoFoto(true);
      const base64 = await comprimirImagem(file, 500, 0.82);
      setFotoUrl(base64);
    } catch {
      alert('Não foi possível processar a foto. Tente outra imagem.');
    } finally {
      setCarregandoFoto(false);
    }
  };

  // Upload e compressão de foto na edição
  const handleUploadFotoEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCarregandoFotoEdit(true);
      const base64 = await comprimirImagem(file, 500, 0.82);
      setEditFotoUrl(base64);
    } catch {
      alert('Não foi possível processar a foto. Tente outra imagem.');
    } finally {
      setCarregandoFotoEdit(false);
    }
  };

  // Filtragem dos produtos
  const produtosFiltrados = produtos.filter(p => {
    const isAtivo = p.ativo !== false;
    if (abaStatus === 'ATIVOS' && !isAtivo) return false;
    if (abaStatus === 'ARQUIVADOS' && isAtivo) return false;

    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busca.toLowerCase()) ||
      (p.marca && p.marca.toLowerCase().includes(busca.toLowerCase()));

    if (!matchBusca) return false;
    if (filtroCategoria === 'TODAS') return true;
    return p.categoria === filtroCategoria;
  });

  // Abertura da Modal de Abastecer
  const abrirModalAbastecer = (p: Produto, e: React.MouseEvent) => {
    e.stopPropagation();
    setProdutoAbastecendo(p);
    setQtdAbastecer('10');
    setCustoNovoLote(p.precoCusto ? p.precoCusto.toFixed(2).replace('.', ',') : '10,00');
    setNovoPrecoVendaSugerido(p.precoVenda.toFixed(2).replace('.', ','));
  };

  // Abertura da Modal de Edição Completa
  const abrirModalEditar = (p: Produto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProdutoEditando(p);
    setEditNome(p.nome);
    setEditCategoriaId(p.categoriaId || categorias[0]?.id || '');
    setEditMarcaNome(p.marca || '');
    setEditPrecoVenda(p.precoVenda.toFixed(2).replace('.', ','));
    setEditPrecoCusto(p.precoCusto !== undefined ? p.precoCusto.toFixed(2).replace('.', ',') : '');
    setEditEstoque(p.estoque.toString());
    setEditAlertaEstoque(p.alertaEstoqueBaixo !== false);
    setEditEstoqueMinimo((p.estoqueMinimo || 1).toString());
    setEditFotoUrl(p.fotoUrl || '');
  };

  // Salvar Edição do Produto
  const handleSalvarEdicao = () => {
    if (!produtoEditando || !editNome.trim()) {
      alert('Preencha o nome do produto.');
      return;
    }

    const venda = parseFloat(editPrecoVenda.replace(',', '.'));
    const custo = parseFloat(editPrecoCusto.replace(',', '.')) || 0;
    const est = parseInt(editEstoque, 10) || 0;
    const lim = parseInt(editEstoqueMinimo, 10) || 1;

    const catObj = categorias.find(c => c.id === editCategoriaId) || categorias[0];

    const atualizado: Produto = {
      ...produtoEditando,
      nome: editNome.trim(),
      precoVenda: venda > 0 ? venda : produtoEditando.precoVenda,
      precoCusto: custo,
      estoque: est,
      categoriaId: catObj?.id,
      categoria: catObj?.nome || produtoEditando.categoria,
      marca: editMarcaNome || undefined,
      emoji: catObj?.emoji || produtoEditando.emoji,
      fotoUrl: editFotoUrl || undefined,
      alertaEstoqueBaixo: editAlertaEstoque,
      estoqueMinimo: lim,
    };

    onAtualizarProduto(atualizado);
    setProdutoEditando(null);
  };

  // Cálculos dinâmicos do Custo Médio Ponderado no Modal
  const qtdAdicionarNum = parseInt(qtdAbastecer, 10) || 0;
  const custoUnitarioNovoNum = parseFloat(custoNovoLote.replace(',', '.')) || 0;
  const qtdAtual = produtoAbastecendo?.estoque || 0;
  const custoAtual = produtoAbastecendo?.precoCusto || 0;

  const novoEstoqueTotal = qtdAtual + qtdAdicionarNum;
  let novoCustoMedioCalculado = custoUnitarioNovoNum;

  if (novoEstoqueTotal > 0 && qtdAtual > 0) {
    const valorEstoqueAtual = qtdAtual * custoAtual;
    const valorNovoLote = qtdAdicionarNum * custoUnitarioNovoNum;
    novoCustoMedioCalculado = Number(((valorEstoqueAtual + valorNovoLote) / novoEstoqueTotal).toFixed(2));
  }

  const precoVendaAtual = parseFloat(novoPrecoVendaSugerido.replace(',', '.')) || produtoAbastecendo?.precoVenda || 0;
  const margemLucroCalculada = precoVendaAtual - novoCustoMedioCalculado;

  // Confirmar Abastecimento
  const handleConfirmarAbastecimento = () => {
    if (!produtoAbastecendo || qtdAdicionarNum <= 0 || custoUnitarioNovoNum <= 0) {
      alert('Preencha a quantidade válida e o custo unitário da compra.');
      return;
    }

    const novoPrecoVenda = parseFloat(novoPrecoVendaSugerido.replace(',', '.')) || produtoAbastecendo.precoVenda;

    onAbastecerProduto(
      produtoAbastecendo.id,
      qtdAdicionarNum,
      custoUnitarioNovoNum,
      novoPrecoVenda
    );

    setProdutoAbastecendo(null);
  };

  // Salvar Novo Produto
  const handleSalvarProduto = () => {
    const venda = parseFloat(precoVenda.replace(',', '.'));
    const custo = parseFloat(precoCusto.replace(',', '.')) || 0;
    const est = parseInt(estoque, 10) || 0;
    const limiteMin = parseInt(estoqueMinimo, 10) || 1;

    if (!nome.trim() || isNaN(venda) || venda <= 0) {
      alert('Preencha o nome do produto e o preço de venda.');
      return;
    }

    const catObj = categorias.find(c => c.id === categoriaId) || categorias[0];

    const novoProduto: Produto = {
      id: 'prod-' + Date.now(),
      nome: nome.trim(),
      precoVenda: venda,
      precoCusto: custo,
      estoque: est,
      categoriaId: catObj?.id,
      categoria: catObj?.nome || 'Geral',
      marca: marcaNome || undefined,
      emoji: catObj?.emoji || '💄',
      fotoUrl: fotoUrl || undefined,
      alertaEstoqueBaixo: alertaEstoque,
      estoqueMinimo: limiteMin,
      ativo: true,
    };

    onAdicionarProduto(novoProduto);
    setNome('');
    setPrecoVenda('');
    setPrecoCusto('');
    setEstoque('5');
    setFotoUrl('');
    setModalNovo(false);
  };

  const handleSalvarMiniCategoria = () => {
    if (!novaCatNome.trim()) return;
    const novaCat: Categoria = {
      id: 'cat-' + Date.now(),
      nome: novaCatNome.trim(),
      emoji: novaCatEmoji || '✨',
    };
    onAdicionarCategoria(novaCat);
    setCategoriaId(novaCat.id);
    setNovaCatNome('');
    setModalMiniCategoria(false);
  };

  const handleSalvarMiniMarca = () => {
    if (!novaMarcaNome.trim()) return;
    const novaM: Marca = {
      id: 'marca-' + Date.now(),
      nome: novaMarcaNome.trim(),
    };
    onAdicionarMarca(novaM);
    setMarcaNome(novaM.nome);
    setNovaMarcaNome('');
    setModalMiniMarca(false);
  };

  return (
    <div className="space-y-4">
      {/* Topo com Botão de Novo Produto */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-radiant-pink fill-radiant-pink" />
            Catálogo & Estoque
          </h2>
          <p className="text-xs text-stone-500">{produtos.length} produtos cadastrados</p>
        </div>
        <button
          onClick={() => setModalNovo(true)}
          className="bg-radiant-pink hover:bg-rose-600 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-sm flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Abas Ativos vs Arquivados */}
      <div className="flex gap-1.5 bg-stone-200/60 p-1 rounded-2xl text-xs font-semibold text-stone-600">
        <button
          onClick={() => setAbaStatus('ATIVOS')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            abaStatus === 'ATIVOS' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-900'
          }`}
        >
          Ativos ({produtos.filter(p => p.ativo !== false).length})
        </button>
        <button
          onClick={() => setAbaStatus('ARQUIVADOS')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            abaStatus === 'ARQUIVADOS' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'hover:text-stone-900'
          }`}
        >
          Arquivados ({produtos.filter(p => p.ativo === false).length})
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar produto por nome, marca ou categoria..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full text-xs bg-white border border-stone-200 rounded-2xl px-3 py-2.5 pl-8 focus:outline-none focus:border-radiant-pink shadow-sm"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
      </div>

      {/* Filtro de Categorias em Chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-semibold">
        <button
          onClick={() => setFiltroCategoria('TODAS')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition ${
            filtroCategoria === 'TODAS'
              ? 'bg-stone-900 text-white font-bold'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Todas
        </button>
        {categorias.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFiltroCategoria(cat.nome)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition flex items-center gap-1 ${
              filtroCategoria === cat.nome
                ? 'bg-radiant-pink text-white font-bold'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.nome}</span>
          </button>
        ))}
      </div>

      {/* Grade de Produtos */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {produtosFiltrados.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-stone-400 bg-white rounded-3xl border border-stone-100">
            Nenhum produto encontrado nesta visualização.
          </div>
        ) : (
          produtosFiltrados.map(p => {
            const limite = p.estoqueMinimo !== undefined ? p.estoqueMinimo : 1;
            const estoqueBaixo = p.alertaEstoqueBaixo !== false && p.estoque <= limite;

            return (
              <div
                key={p.id}
                className="bg-white p-3.5 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-between space-y-2.5 hover:border-rose-200 transition relative"
              >
                <div>
                  <div className="w-full h-24 bg-rose-50/70 rounded-2xl flex items-center justify-center text-3xl shadow-inner mb-2 relative overflow-hidden">
                    {p.fotoUrl ? (
                      <img src={p.fotoUrl} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span>{p.emoji || '💄'}</span>
                    )}

                    {/* Botão de Abastecimento Rápido no topo da foto */}
                    <button
                      type="button"
                      onClick={(e) => abrirModalAbastecer(p, e)}
                      title="Abastecer estoque (Custo Médio)"
                      className="absolute top-1.5 right-1.5 bg-radiant-pink hover:bg-rose-600 active:scale-90 text-white p-1 rounded-lg shadow-sm transition"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                      {p.categoria}
                    </span>
                    {p.marca && (
                      <span className="text-[9px] bg-stone-100 text-stone-600 font-bold px-1.5 py-0.2 rounded-md max-w-[90px] truncate">
                        {p.marca}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-stone-900 leading-tight mt-0.5 line-clamp-2">
                    {p.nome}
                  </p>
                </div>

                {/* Preços e Estoque */}
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-radiant-pink text-sm block">
                        {formatCurrency(p.precoVenda)}
                      </span>
                      {p.precoCusto !== undefined && (
                        <span className="text-[10px] text-stone-400">
                          Custo médio: {formatCurrency(p.precoCusto)}
                        </span>
                      )}
                    </div>

                    <span
                      title={estoqueBaixo ? `Alerta! Estoque atingiu o limite de ${limite} un` : 'Estoque regular'}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 shrink-0 ${
                        estoqueBaixo
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {estoqueBaixo && <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />}
                      {p.estoque} un
                    </span>
                  </div>

                  {/* Barra de Ações Rápidas: 4 botões proporcionais e simétricos */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => abrirModalAbastecer(p, e)}
                      title="Abastecer Estoque (+ un)"
                      className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 active:scale-90 text-radiant-pink flex items-center justify-center transition border border-rose-200/60 shadow-2xs"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => abrirModalEditar(p, e)}
                      title="Editar dados (Preço, Foto, Nome)"
                      className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-rose-50 active:scale-90 text-stone-500 hover:text-radiant-pink flex items-center justify-center transition border border-stone-200/60"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onAlternarStatusProduto(p.id)}
                      title={p.ativo === false ? 'Reativar produto' : 'Desativar / Arquivar produto'}
                      className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-100 active:scale-90 text-stone-500 hover:text-stone-800 flex items-center justify-center transition border border-stone-200/60"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir o produto "${p.nome}" do catálogo?`)) {
                          onExcluirProduto(p.id);
                        }
                      }}
                      title="Excluir produto"
                      className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-rose-50 active:scale-90 text-stone-400 hover:text-rose-600 flex items-center justify-center transition border border-stone-200/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE ABASTECER ESTOQUE (CUSTO MÉDIO PONDERADO) */}
      {produtoAbastecendo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div>
              <span className="text-[10px] bg-rose-100 text-radiant-pink font-bold px-2 py-0.5 rounded-full">
                Abastecimento & Custo Médio
              </span>
              <h3 className="font-extrabold text-sm text-stone-900 mt-1 flex items-center gap-1.5">
                <PackagePlus className="w-4 h-4 text-radiant-pink" />
                {produtoAbastecendo.emoji} {produtoAbastecendo.nome}
              </h3>
            </div>

            {/* Situação Atual */}
            <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-semibold">Estoque Atual:</span>
                <p className="font-extrabold text-stone-800 text-sm">{qtdAtual} un</p>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-semibold">Custo Atual Unitário:</span>
                <p className="font-extrabold text-stone-800 text-sm">{formatCurrency(custoAtual)}</p>
              </div>
            </div>

            {/* Inputs do Novo Lote */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 mb-1 font-bold">Qtd que Chegou (+):</label>
                  <input
                    type="number"
                    min="1"
                    value={qtdAbastecer}
                    onChange={e => setQtdAbastecer(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-extrabold text-stone-900 text-center focus:outline-none focus:border-radiant-pink"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-bold">Custo Pago Nesta (R$):</label>
                  <input
                    type="text"
                    value={custoNovoLote}
                    onChange={e => setCustoNovoLote(e.target.value)}
                    placeholder="Ex: 12,00"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-extrabold text-stone-900 text-center focus:outline-none focus:border-radiant-pink"
                  />
                </div>
              </div>

              {/* Preço de Venda para Comparação e Reajuste */}
              <div>
                <label className="block text-stone-700 mb-1 font-bold flex items-center justify-between">
                  <span>Preço de Venda do Produto (R$):</span>
                  <span className="text-[10px] text-stone-400 font-normal">Pode alterar se quiser reajustar</span>
                </label>
                <input
                  type="text"
                  value={novoPrecoVendaSugerido}
                  onChange={e => setNovoPrecoVendaSugerido(e.target.value)}
                  placeholder="Ex: 75,00"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-extrabold text-stone-900 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              {/* Resultado do Custo Médio Calculado */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50/60 p-3.5 rounded-2xl border border-rose-200/90 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 font-semibold">Novo Estoque Consolidado:</span>
                  <span className="font-extrabold text-stone-900">{novoEstoqueTotal} un</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-rose-200/60">
                  <span className="text-stone-800 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-radiant-pink" />
                    Novo Custo Médio:
                  </span>
                  <span className="font-extrabold text-base text-radiant-pink">
                    {formatCurrency(novoCustoMedioCalculado)} / un
                  </span>
                </div>

                <div className="pt-2 border-t border-rose-200/60 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-700 font-medium">💰 Lucro Líquido por Unidade:</span>
                    <span className="font-extrabold text-emerald-700">
                      +{formatCurrency(margemLucroCalculada)} / un
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-700 font-bold">📈 Margem de Lucro (% em cima do custo):</span>
                    <span className="font-extrabold text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                      +{novoCustoMedioCalculado > 0 ? ((margemLucroCalculada / novoCustoMedioCalculado) * 100).toFixed(0) : '0'}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-rose-200/40 text-stone-700">
                    <span className="font-semibold">📦 Lucro Total no Estoque ({novoEstoqueTotal} un):</span>
                    <span className="font-extrabold text-emerald-700">
                      +{formatCurrency(margemLucroCalculada * novoEstoqueTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setProdutoAbastecendo(null)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 py-2.5 rounded-xl text-xs font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarAbastecimento}
                className="flex-1 bg-radiant-pink hover:bg-rose-600 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-radiant-pink/30"
              >
                Confirmar Abastecimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDITAR PRODUTO COMPLETO */}
      {produtoEditando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
              <Pencil className="w-4 h-4 text-radiant-pink" />
              Editar Produto: {produtoEditando.nome}
            </h3>

            <div className="space-y-3 text-xs">
              {/* Foto do Produto */}
              <div>
                <label className="block text-stone-600 mb-1 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-radiant-pink" />
                    Foto do Produto:
                  </span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                  onChange={handleUploadFotoEdit}
                  className="hidden"
                />

                {editFotoUrl ? (
                  <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-rose-200 group shadow-inner">
                    <img src={editFotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditFotoUrl('')}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full shadow transition"
                      title="Remover foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-stone-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow transition"
                    >
                      Trocar Foto
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={carregandoFotoEdit}
                    className="w-full h-20 border-2 border-dashed border-rose-200 hover:border-radiant-pink rounded-2xl bg-rose-50/40 hover:bg-rose-50/70 flex flex-col items-center justify-center gap-1 transition text-stone-600"
                  >
                    <Camera className="w-5 h-5 text-radiant-pink" />
                    <span className="font-bold text-[11px] text-stone-700">
                      {carregandoFotoEdit ? 'Processando imagem...' : 'Tirar Foto ou Escolher da Galeria'}
                    </span>
                  </button>
                )}
              </div>

              {/* Nome do Produto */}
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Nome do Produto</label>
                <input
                  type="text"
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Categoria</label>
                <select
                  value={editCategoriaId}
                  onChange={e => setEditCategoriaId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
                >
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Marca</label>
                <select
                  value={editMarcaNome}
                  onChange={e => setEditMarcaNome(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
                >
                  <option value="">Sem Marca / Própria</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Preço Venda (R$)</label>
                  <input
                    type="text"
                    value={editPrecoVenda}
                    onChange={e => setEditPrecoVenda(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Preço Custo (R$)</label>
                  <input
                    type="text"
                    value={editPrecoCusto}
                    onChange={e => setEditPrecoCusto(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                  />
                </div>
              </div>

              {/* Estoque e Alerta */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-stone-800 font-bold">Estoque Atual:</label>
                  <input
                    type="number"
                    min="0"
                    value={editEstoque}
                    onChange={e => setEditEstoque(e.target.value)}
                    className="w-20 bg-white border border-stone-200 rounded-lg p-1.5 text-center font-bold focus:outline-none focus:border-radiant-pink"
                  />
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <label className="text-stone-700 font-semibold flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAlertaEstoque}
                      onChange={e => setEditAlertaEstoque(e.target.checked)}
                      className="accent-radiant-pink w-4 h-4 rounded"
                    />
                    <span>Avisar estoque baixo?</span>
                  </label>

                  {editAlertaEstoque && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-600">
                      <span>Quando atingir:</span>
                      <input
                        type="number"
                        min="1"
                        value={editEstoqueMinimo}
                        onChange={e => setEditEstoqueMinimo(e.target.value)}
                        className="w-12 bg-white border border-stone-200 rounded-md p-1 text-center font-bold"
                      />
                      <span>un</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProdutoEditando(null)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 py-2.5 rounded-xl text-xs font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarEdicao}
                className="flex-1 bg-radiant-pink hover:bg-rose-600 py-2.5 rounded-xl text-xs font-bold text-white shadow"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO PRODUTO COM CATEGORIA, MARCA E FOTO */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-radiant-pink" />
              Cadastrar Novo Produto
            </h3>

            <div className="space-y-3 text-xs">
              {/* Upload de Foto Real */}
              <div>
                <label className="block text-stone-600 mb-1 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-radiant-pink" />
                    Foto do Produto:
                  </span>
                  <span className="text-[10px] text-stone-400">Opcional</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleUploadFoto}
                  className="hidden"
                />

                {fotoUrl ? (
                  <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-rose-200 group shadow-inner">
                    <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoUrl('')}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full shadow transition"
                      title="Remover foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-stone-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow transition"
                    >
                      Trocar Foto
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={carregandoFoto}
                    className="w-full h-20 border-2 border-dashed border-rose-200 hover:border-radiant-pink rounded-2xl bg-rose-50/40 hover:bg-rose-50/70 flex flex-col items-center justify-center gap-1 transition text-stone-600 active:scale-[0.99]"
                  >
                    <Camera className="w-5 h-5 text-radiant-pink" />
                    <span className="font-bold text-[11px] text-stone-700">
                      {carregandoFoto ? 'Processando imagem...' : 'Tirar Foto ou Escolher da Galeria'}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      Câmera do celular ou arquivo do PC
                    </span>
                  </button>
                )}
              </div>

              {/* Seleção de Categoria */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-600 font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-radiant-pink" />
                    Categoria (define o emoji):
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalMiniCategoria(true)}
                    className="text-[10px] text-radiant-pink font-bold hover:underline"
                  >
                    + Nova Categoria
                  </button>
                </div>
                <select
                  value={categoriaId}
                  onChange={e => setCategoriaId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
                >
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Marca */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-600 font-semibold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-radiant-pink" />
                    Marca do Produto:
                  </label>
                  <button
                    type="button"
                    onClick={() => setModalMiniMarca(true)}
                    className="text-[10px] text-radiant-pink font-bold hover:underline"
                  >
                    + Nova Marca
                  </button>
                </div>
                <select
                  value={marcaNome}
                  onChange={e => setMarcaNome(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-radiant-pink"
                >
                  <option value="">Sem Marca / Própria</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nome do Produto */}
              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Batom Matte Velvet Red"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                />
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Preço Venda (R$) *</label>
                  <input
                    type="text"
                    placeholder="Ex: 49,90"
                    value={precoVenda}
                    onChange={e => setPrecoVenda(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Preço Custo (R$)</label>
                  <input
                    type="text"
                    placeholder="Ex: 25,00"
                    value={precoCusto}
                    onChange={e => setPrecoCusto(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
                  />
                </div>
              </div>

              {/* Estoque e Configuração de Notificação de Estoque Baixo */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-stone-800 font-bold">Estoque Inicial:</label>
                  <input
                    type="number"
                    min="0"
                    value={estoque}
                    onChange={e => setEstoque(e.target.value)}
                    className="w-20 bg-white border border-stone-200 rounded-lg p-1.5 text-center font-bold focus:outline-none focus:border-radiant-pink"
                  />
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <label className="text-stone-700 font-semibold flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertaEstoque}
                      onChange={e => setAlertaEstoque(e.target.checked)}
                      className="accent-radiant-pink w-4 h-4 rounded"
                    />
                    <span>Avisar estoque baixo?</span>
                  </label>

                  {alertaEstoque && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-600">
                      <span>Quando atingir:</span>
                      <input
                        type="number"
                        min="1"
                        value={estoqueMinimo}
                        onChange={e => setEstoqueMinimo(e.target.value)}
                        className="w-12 bg-white border border-stone-200 rounded-md p-1 text-center font-bold"
                      />
                      <span>un</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                className="flex-1 bg-stone-100 hover:bg-stone-200 py-2.5 rounded-xl text-xs font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarProduto}
                className="flex-1 bg-radiant-pink hover:bg-rose-600 py-2.5 rounded-xl text-xs font-bold text-white shadow"
              >
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINI MODAL NOVA CATEGORIA */}
      {modalMiniCategoria && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl space-y-3 text-xs">
            <h4 className="font-bold text-stone-900">Cadastrar Nova Categoria</h4>
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Nome da Categoria</label>
              <input
                type="text"
                placeholder="Ex: Iluminadores, Batons"
                value={novaCatNome}
                onChange={e => setNovaCatNome(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
              />
            </div>
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Emoji Representativo</label>
              <input
                type="text"
                value={novaCatEmoji}
                onChange={e => setNovaCatEmoji(e.target.value)}
                placeholder="Ex: 💄, ✨, 🧴"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center text-lg focus:outline-none focus:border-radiant-pink"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalMiniCategoria(false)}
                className="flex-1 bg-stone-100 py-2 rounded-xl font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarMiniCategoria}
                className="flex-1 bg-radiant-pink text-white py-2 rounded-xl font-bold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MINI MODAL NOVA MARCA */}
      {modalMiniMarca && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl space-y-3 text-xs">
            <h4 className="font-bold text-stone-900">Cadastrar Nova Marca</h4>
            <div>
              <label className="block text-stone-600 mb-1 font-semibold">Nome da Marca</label>
              <input
                type="text"
                placeholder="Ex: Mari Maria, Mac, Dalla"
                value={novaMarcaNome}
                onChange={e => setNovaMarcaNome(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:border-radiant-pink"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalMiniMarca(false)}
                className="flex-1 bg-stone-100 py-2 rounded-xl font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarMiniMarca}
                className="flex-1 bg-radiant-pink text-white py-2 rounded-xl font-bold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
