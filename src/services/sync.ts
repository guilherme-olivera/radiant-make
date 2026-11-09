import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { storage } from './storage';
import { Cliente, Produto, Venda, Cobranca, ConfiguracoesLoja } from '../types';

export interface SyncStatus {
  online: boolean;
  cloudConnected: boolean;
  sincronizando: boolean;
  ultimaSincronizacao: string | null;
  mensagem: string;
}

export const syncService = {
  isConfigured: () => isSupabaseConfigured(),

  // Puxa os dados atualizados da nuvem (Supabase -> LocalStorage)
  puxarDaNuvem: async (): Promise<{ sucesso: boolean; mensagem: string }> => {
    const supabase = getSupabaseClient();
    if (!isSupabaseConfigured() || !supabase) {
      return { sucesso: false, mensagem: 'Supabase não configurado' };
    }

    try {
      // 1. Configurações da loja
      const { data: configData } = await supabase.from('configuracoes_loja').select('*').limit(1);
      if (configData && configData.length > 0) {
        const c = configData[0];
        const configLocal: ConfiguracoesLoja = {
          nomeLoja: c.nome_loja || 'Radiant Make',
          chavePix: c.chave_pix || '',
          tipoChavePix: c.tipo_chave_pix || 'Celular',
          whatsappLoja: c.whatsapp_loja || '',
          cupomAniversarioPadrao: c.cupom_aniversario_padrao || 'NIVER10',
          mensagemAgradecimento: c.mensagem_agradecimento,
          mensagemLembrete: c.mensagem_lembrete,
          mensagemCobranca: c.mensagem_cobranca,
          mensagemAniversario: c.mensagem_aniversario,
          mensagemDataComemorativa: c.mensagem_data_comemorativa,
        };
        storage.saveConfig(configLocal);
      }

      // 2. Categorias
      const { data: catData } = await supabase.from('categorias').select('*');
      if (catData && catData.length > 0) {
        storage.saveCategorias(catData.map(c => ({ id: c.id, nome: c.nome, emoji: c.emoji })));
      }

      // 3. Marcas
      const { data: marcasData } = await supabase.from('marcas').select('*');
      if (marcasData && marcasData.length > 0) {
        storage.saveMarcas(marcasData.map(m => ({ id: m.id, nome: m.nome })));
      }

      // 4. Clientes
      const { data: cliData } = await supabase.from('clientes').select('*');
      if (cliData) {
        const clientes: Cliente[] = cliData.map(c => ({
          id: c.id,
          nome: c.nome,
          referencia: c.referencia || undefined,
          whatsapp: c.whatsapp,
          instagram: c.instagram || undefined,
          dataNascimento: c.data_nascimento || undefined,
          genero: c.genero || 'FEMININO',
          totalComprado: Number(c.total_comprado || 0)
        }));
        storage.saveClientes(clientes);
      }

      // 5. Produtos
      const { data: prodData } = await supabase.from('produtos').select('*');
      if (prodData) {
        const produtos: Produto[] = prodData.map(p => ({
          id: p.id,
          nome: p.nome,
          precoVenda: Number(p.preco_venda),
          precoCusto: Number(p.preco_custo || 0),
          estoque: Number(p.estoque),
          categoriaId: p.categoria_id || undefined,
          categoria: p.categoria,
          marca: p.marca || undefined,
          emoji: p.emoji || '💄',
          fotoUrl: p.foto_url || undefined,
          alertaEstoqueBaixo: p.alerta_estoque_baixo !== false,
          estoqueMinimo: Number(p.estoque_minimo || 1),
          ativo: p.ativo !== false
        }));
        storage.saveProdutos(produtos);
      }

      // 6. Vendas
      const { data: vendasData } = await supabase.from('vendas').select('*').order('data', { ascending: false });
      if (vendasData) {
        const vendas: Venda[] = vendasData.map(v => ({
          id: v.id,
          clienteId: v.cliente_id || undefined,
          clienteNome: v.cliente_nome,
          clienteWhatsapp: v.cliente_whatsapp,
          data: v.data,
          itens: v.itens,
          subtotal: v.subtotal ? Number(v.subtotal) : Number(v.total),
          desconto: v.desconto ? Number(v.desconto) : 0,
          total: Number(v.total),
          formaPagamento: v.forma_pagamento,
          quantidadeParcelas: v.quantidade_parcelas || 1,
          dataVencimento: v.data_vencimento || undefined,
          statusCobranca: v.status_cobranca
        }));
        storage.saveVendas(vendas);
      }

      // 7. Cobranças
      const { data: cobData } = await supabase.from('cobrancas').select('*').order('data_vencimento', { ascending: true });
      if (cobData) {
        const cobrancas: Cobranca[] = cobData.map(c => ({
          id: c.id,
          vendaId: c.venda_id,
          clienteId: c.cliente_id || undefined,
          clienteNome: c.cliente_nome,
          clienteWhatsapp: c.cliente_whatsapp,
          descricaoItens: c.descricao_itens,
          valor: Number(c.valor),
          dataVencimento: c.data_vencimento,
          status: c.status,
          dataPagamento: c.data_pagamento || undefined,
          formaPagamento: c.forma_pagamento || 'PRAZO',
          numeroParcela: c.numero_parcela || 1,
          totalParcelas: c.total_parcelas || 1,
          itensDetalhados: c.itens_detalhados || undefined
        }));
        storage.saveCobrancas(cobrancas);
      }

      return { sucesso: true, mensagem: 'Dados atualizados da nuvem com sucesso!' };
    } catch (err: any) {
      return { sucesso: false, mensagem: err.message || 'Erro ao puxar dados da nuvem' };
    }
  },

  // Excluir cliente diretamente na nuvem
  excluirClienteNaNuvem: async (id: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('clientes').delete().eq('id', id);
    }
  },

  // Excluir produto diretamente na nuvem
  excluirProdutoNaNuvem: async (id: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('produtos').delete().eq('id', id);
    }
  },

  // Excluir venda diretamente na nuvem
  excluirVendaNaNuvem: async (id: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('vendas').delete().eq('id', id);
    }
  },

  // Envia dados locais para a nuvem (LocalStorage -> Supabase)
  enviarParaNuvem: async (): Promise<{ sucesso: boolean; mensagem: string }> => {
    const supabase = getSupabaseClient();
    if (!isSupabaseConfigured() || !supabase) {
      return { sucesso: false, mensagem: 'Supabase não configurado' };
    }

    try {
      // 1. Categorias e Marcas
      const categoriasLocais = storage.getCategorias();
      if (categoriasLocais.length > 0) {
        await supabase.from('categorias').upsert(
          categoriasLocais.map(c => ({ id: c.id, nome: c.nome, emoji: c.emoji }))
        );
      }

      const marcasLocais = storage.getMarcas();
      if (marcasLocais.length > 0) {
        await supabase.from('marcas').upsert(
          marcasLocais.map(m => ({ id: m.id, nome: m.nome }))
        );
      }

      // 2. Clientes
      const clientesLocais = storage.getClientes();
      if (clientesLocais.length > 0) {
        await supabase.from('clientes').upsert(
          clientesLocais.map(cli => ({
            id: cli.id,
            nome: cli.nome,
            referencia: cli.referencia || null,
            whatsapp: cli.whatsapp,
            instagram: cli.instagram || null,
            data_nascimento: cli.dataNascimento || null,
            genero: cli.genero || 'FEMININO',
            total_comprado: cli.totalComprado || 0,
          }))
        );
      }

      // 3. Produtos
      const produtosLocais = storage.getProdutos();
      if (produtosLocais.length > 0) {
        await supabase.from('produtos').upsert(
          produtosLocais.map(p => ({
            id: p.id,
            nome: p.nome,
            preco_venda: p.precoVenda,
            preco_custo: p.precoCusto || 0,
            estoque: p.estoque,
            categoria_id: p.categoriaId || null,
            categoria: p.categoria,
            marca: p.marca || null,
            emoji: p.emoji || '💄',
            foto_url: p.fotoUrl || null,
            alerta_estoque_baixo: p.alertaEstoqueBaixo !== false,
            estoque_minimo: p.estoqueMinimo || 1,
            ativo: p.ativo !== false,
          }))
        );
      }

      // 4. Vendas
      const vendasLocais = storage.getVendas();
      if (vendasLocais.length > 0) {
        await supabase.from('vendas').upsert(
          vendasLocais.map(v => ({
            id: v.id,
            cliente_id: v.clienteId || null,
            cliente_nome: v.clienteNome,
            cliente_whatsapp: v.clienteWhatsapp,
            data: v.data,
            itens: v.itens,
            subtotal: v.subtotal || v.total,
            desconto: v.desconto || 0,
            total: v.total,
            forma_pagamento: v.formaPagamento,
            quantidade_parcelas: v.quantidadeParcelas || 1,
            data_vencimento: v.dataVencimento || null,
            status_cobranca: v.statusCobranca,
          }))
        );
      }

      // 5. Cobranças
      const cobrancasLocais = storage.getCobrancas();
      if (cobrancasLocais.length > 0) {
        await supabase.from('cobrancas').upsert(
          cobrancasLocais.map(cob => ({
            id: cob.id,
            venda_id: cob.vendaId,
            cliente_id: cob.clienteId || null,
            cliente_nome: cob.clienteNome,
            cliente_whatsapp: cob.clienteWhatsapp,
            descricao_itens: cob.descricaoItens,
            valor: cob.valor,
            data_vencimento: cob.dataVencimento,
            status: cob.status,
            data_pagamento: cob.dataPagamento || null,
            forma_pagamento: cob.formaPagamento || 'PRAZO',
            numero_parcela: cob.numeroParcela || 1,
            total_parcelas: cob.totalParcelas || 1,
            itens_detalhados: cob.itensDetalhados || null,
          }))
        );
      }

      return { sucesso: true, mensagem: 'Dados locais enviados para a nuvem!' };
    } catch (err: any) {
      return { sucesso: false, mensagem: err.message || 'Erro ao enviar dados para a nuvem' };
    }
  },

  // Sincronização Completa (Envia pendências locais e atualiza da nuvem)
  sincronizarTudo: async (): Promise<{ sucesso: boolean; mensagem: string }> => {
    const supabase = getSupabaseClient();
    if (!isSupabaseConfigured() || !supabase) {
      return {
        sucesso: true,
        mensagem: 'Modo Local Ativo (Dados salvos com segurança no aparelho).',
      };
    }

    if (!navigator.onLine) {
      return {
        sucesso: false,
        mensagem: 'Aparelho offline. Suas alterações estão salvas no dispositivo e serão sincronizadas quando voltar a internet.',
      };
    }

    try {
      // 1. Envia o que foi feito localmente
      await syncService.enviarParaNuvem();

      // 2. Puxa os dados consolidados do Supabase
      await syncService.puxarDaNuvem();

      // Atualiza timestamp da última sincronização
      const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('radiant_last_sync', agora);

      return {
        sucesso: true,
        mensagem: `Sincronizado com o Supabase com sucesso às ${agora}!`,
      };
    } catch (error: any) {
      return {
        sucesso: false,
        mensagem: `Erro na sincronização: ${error.message || 'Falha de comunicação'}`,
      };
    }
  },
};
