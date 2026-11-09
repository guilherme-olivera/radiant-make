import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { NovaVenda } from './components/NovaVenda';
import { Cobrancas } from './components/Cobrancas';
import { Catalogo } from './components/Catalogo';
import { Clientes } from './components/Clientes';
import { Relatorios } from './components/Relatorios';
import { Configuracoes } from './components/Configuracoes';
import { Login } from './components/Login';
import { storage } from './services/storage';
import { syncService } from './services/sync';
import { Cliente, Produto, Venda, Cobranca, ConfiguracoesLoja, Categoria, Marca } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Estado de Autenticação (PIN / Biometria / Senha Mestra)
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    const sessao = localStorage.getItem('radiant_auth_session');
    if (sessao) {
      try {
        const parsed = JSON.parse(sessao);
        return Boolean(parsed.autenticado);
      } catch {
        return false;
      }
    }
    return false;
  });

  // Estados principais
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [config, setConfig] = useState<ConfiguracoesLoja>(storage.getConfig());

  // Recarregar todos os dados do LocalStorage
  const recarregarDados = () => {
    setClientes(storage.getClientes());
    setProdutos(storage.getProdutos());
    setVendas(storage.getVendas());
    setCobrancas(storage.getCobrancas());
    setCategorias(storage.getCategorias());
    setMarcas(storage.getMarcas());
    setConfig(storage.getConfig());
  };

  // Carregar dados na inicialização e sincronizar com Supabase
  useEffect(() => {
    // 1. Limpeza automática de dados de teste de versões anteriores
    const versaoProducao = localStorage.getItem('radiant_prod_v1');
    if (!versaoProducao) {
      storage.saveClientes([]);
      storage.saveProdutos([]);
      storage.saveVendas([]);
      storage.saveCobrancas([]);
      localStorage.setItem('radiant_prod_v1', 'true');
    }

    recarregarDados();

    if (syncService.isConfigured() && navigator.onLine) {
      // Puxa a verdade do banco Supabase primeiro
      syncService.puxarDaNuvem().then(res => {
        if (res.sucesso) {
          recarregarDados();
        }
      });
    }
  }, []);

  // Sincronização manual acionada pelo usuário
  const handleSincronizarNuvem = async () => {
    const res = await syncService.sincronizarTudo();
    if (res.sucesso) {
      recarregarDados();
    }
    return res;
  };

  // Sincronização em background após mutações
  const dispararSyncBackground = () => {
    if (syncService.isConfigured() && navigator.onLine) {
      syncService.enviarParaNuvem().catch(() => {});
    }
  };

  // Handlers de Venda e Clientes
  const handleSalvarVenda = (novaVenda: Venda) => {
    storage.saveVenda(novaVenda);
    setVendas(storage.getVendas());
    setProdutos(storage.getProdutos());
    setCobrancas(storage.getCobrancas());
    dispararSyncBackground();
  };

  const handleExcluirVenda = (id: string) => {
    const atualizadas = vendas.filter(v => v.id !== id);
    setVendas(atualizadas);
    localStorage.setItem('radiant_vendas', JSON.stringify(atualizadas));
    syncService.excluirVendaNaNuvem(id).catch(() => {});
    dispararSyncBackground();
  };

  const handleCadastrarCliente = (novoCliente: Cliente) => {
    const atualizados = [novoCliente, ...clientes];
    setClientes(atualizados);
    storage.saveClientes(atualizados);
    dispararSyncBackground();
  };

  const handleAtualizarCliente = (clienteAtualizado: Cliente) => {
    const atualizados = clientes.map(c => (c.id === clienteAtualizado.id ? clienteAtualizado : c));
    setClientes(atualizados);
    storage.saveClientes(atualizados);
    dispararSyncBackground();
  };

  const handleExcluirCliente = (id: string) => {
    const atualizados = clientes.filter(c => c.id !== id);
    setClientes(atualizados);
    storage.saveClientes(atualizados);
    syncService.excluirClienteNaNuvem(id).catch(() => {});
    dispararSyncBackground();
  };

  // Handlers de Produtos & Estoque
  const handleAdicionarProduto = (novoProduto: Produto) => {
    const atualizados = [novoProduto, ...produtos];
    setProdutos(atualizados);
    storage.saveProdutos(atualizados);
    dispararSyncBackground();
  };

  const handleAtualizarProduto = (produtoAtualizado: Produto) => {
    storage.atualizarProduto(produtoAtualizado);
    setProdutos(storage.getProdutos());
    dispararSyncBackground();
  };

  const handleAbastecerProduto = (
    id: string,
    quantidade: number,
    novoCusto: number,
    novoPrecoVenda?: number
  ) => {
    storage.abastecerProduto(id, quantidade, novoCusto, novoPrecoVenda);
    setProdutos(storage.getProdutos());
    dispararSyncBackground();
  };

  const handleExcluirProduto = (id: string) => {
    storage.excluirProduto(id);
    setProdutos(storage.getProdutos());
    syncService.excluirProdutoNaNuvem(id).catch(() => {});
    dispararSyncBackground();
  };

  const handleAlternarStatusProduto = (id: string) => {
    storage.alternarStatusProduto(id);
    setProdutos(storage.getProdutos());
    dispararSyncBackground();
  };

  // Handlers de Categorias e Marcas
  const handleSalvarCategorias = (novasCategorias: Categoria[]) => {
    storage.saveCategorias(novasCategorias);
    setCategorias(novasCategorias);
    dispararSyncBackground();
  };

  const handleSalvarMarcas = (novasMarcas: Marca[]) => {
    storage.saveMarcas(novasMarcas);
    setMarcas(novasMarcas);
    dispararSyncBackground();
  };

  // Handlers de Cobranças
  const handleDarBaixaCobranca = (id: string) => {
    storage.darBaixaCobranca(id);
    setCobrancas(storage.getCobrancas());
    dispararSyncBackground();
  };

  const handleAtualizarVencimento = (id: string, novaData: string) => {
    storage.atualizarDataVencimentoCobranca(id, novaData);
    setCobrancas(storage.getCobrancas());
    dispararSyncBackground();
  };

  // Handler de Config
  const handleSalvarConfig = (novaConfig: ConfiguracoesLoja) => {
    storage.saveConfig(novaConfig);
    setConfig(novaConfig);
    dispararSyncBackground();
  };

  const handleBloquear = () => {
    localStorage.removeItem('radiant_auth_session');
    setAutenticado(false);
  };

  const hoje = new Date().toISOString().split('T')[0];
  const pendentesHojeCount = cobrancas.filter(c => c.status !== 'PAGO' && c.dataVencimento <= hoje).length;

  // Se não estiver autenticado, exibe a tela de Login/PIN/Biometria
  if (!autenticado) {
    return <Login onLoginSucesso={() => setAutenticado(true)} />;
  }

  return (
    <div className="bg-stone-900 text-stone-800 flex justify-center items-center min-h-screen p-0 sm:p-4">
      {/* Container simulando tela de smartphone ou PWA */}
      <div className="w-full max-w-md h-[100dvh] min-h-[100dvh] sm:h-[880px] bg-radiant-50 sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col border sm:border-stone-800 relative">
        {/* Top Header */}
        <Header
          onOpenCobrancas={() => setCurrentTab('cobrancas')}
          onOpenConfig={() => setCurrentTab('config')}
          onOpenRelatorios={() => setCurrentTab('relatorios')}
          onBloquear={handleBloquear}
          pendentesHojeCount={pendentesHojeCount}
        />

        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32 p-4">
          {currentTab === 'dashboard' && (
            <Dashboard
              vendas={vendas}
              cobrancas={cobrancas}
              clientes={clientes}
              produtos={produtos}
              config={config}
              onNovaVenda={() => setCurrentTab('venda')}
              onVerCobrancas={() => setCurrentTab('cobrancas')}
              onAbrirCampanhas={() => setCurrentTab('config')}
              onAbrirCatalogo={() => setCurrentTab('catalogo')}
              onAbrirRelatorios={() => setCurrentTab('relatorios')}
              onAbrirClientes={() => setCurrentTab('clientes')}
            />
          )}

          {currentTab === 'clientes' && (
            <Clientes
              clientes={clientes}
              vendas={vendas}
              cobrancas={cobrancas}
              onAdicionarCliente={handleCadastrarCliente}
              onAtualizarCliente={handleAtualizarCliente}
              onExcluirCliente={handleExcluirCliente}
              onVoltar={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'venda' && (
            <NovaVenda
              clientes={clientes}
              produtos={produtos}
              config={config}
              onSalvarVenda={handleSalvarVenda}
              onCadastrarCliente={handleCadastrarCliente}
              onVoltar={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'cobrancas' && (
            <Cobrancas
              cobrancas={cobrancas}
              config={config}
              onDarBaixa={handleDarBaixaCobranca}
              onAtualizarVencimento={handleAtualizarVencimento}
            />
          )}

          {currentTab === 'catalogo' && (
            <Catalogo
              produtos={produtos}
              categorias={categorias}
              marcas={marcas}
              onAdicionarProduto={handleAdicionarProduto}
              onAtualizarProduto={handleAtualizarProduto}
              onAdicionarCategoria={novaCat => {
                const updated = [...categorias, novaCat];
                handleSalvarCategorias(updated);
              }}
              onAdicionarMarca={novaM => {
                const updated = [...marcas, novaM];
                handleSalvarMarcas(updated);
              }}
              onAbastecerProduto={handleAbastecerProduto}
              onExcluirProduto={handleExcluirProduto}
              onAlternarStatusProduto={handleAlternarStatusProduto}
              onAbrirConfiguracoes={() => setCurrentTab('config')}
            />
          )}

          {currentTab === 'relatorios' && (
            <Relatorios
              vendas={vendas}
              produtos={produtos}
              config={config}
              onExcluirVenda={handleExcluirVenda}
            />
          )}

          {currentTab === 'config' && (
            <Configuracoes
              config={config}
              categorias={categorias}
              marcas={marcas}
              clientes={clientes}
              onSalvarConfig={handleSalvarConfig}
              onSalvarCategorias={handleSalvarCategorias}
              onSalvarMarcas={handleSalvarMarcas}
              onVoltar={() => setCurrentTab('dashboard')}
              onSincronizarNuvem={handleSincronizarNuvem}
              onBloquear={handleBloquear}
            />
          )}
        </main>

        {/* Bottom Nav Bar */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={tab => setCurrentTab(tab)}
          cobrancasAlertCount={pendentesHojeCount}
        />
      </div>
    </div>
  );
};

export default App;
