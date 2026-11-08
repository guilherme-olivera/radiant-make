const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  const url = 'https://filsokpyqndkbskwbscn.supabase.co';
  const key = 'sb_publishable_aAJrZAouL2qe9d_Mm5ylBw_kd5B1SrK';

  console.log('Testando cliente Supabase com URL e Publishable Key...');
  const supabase = createClient(url, key);

  const { data: categorias, error: errCat } = await supabase.from('categorias').select('*');
  if (errCat) {
    console.error('❌ Erro ao buscar categorias via API Supabase:', errCat);
  } else {
    console.log('✅ Categorias buscadas com sucesso via API Supabase:', categorias.length, 'registros encontrados.');
    console.log(categorias.map(c => `${c.emoji} ${c.nome}`).join(', '));
  }

  const { data: marcas, error: errMarcas } = await supabase.from('marcas').select('*');
  if (errMarcas) {
    console.error('❌ Erro ao buscar marcas via API Supabase:', errMarcas);
  } else {
    console.log('✅ Marcas buscadas com sucesso:', marcas.length, 'registros.');
  }

  const { data: config, error: errConfig } = await supabase.from('configuracoes_loja').select('*');
  if (errConfig) {
    console.error('❌ Erro ao buscar config:', errConfig);
  } else {
    console.log('✅ Configurações da loja carregadas com sucesso:', config[0]?.nome_loja);
  }
}

testSupabase();

