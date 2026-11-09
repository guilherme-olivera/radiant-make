const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Maraccini26%40@db.filsokpyqndkbskwbscn.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();

  // 1. Deletar cobranças e vendas fictícias
  const rCob = await client.query('DELETE FROM public.cobrancas;');
  const rVen = await client.query('DELETE FROM public.vendas;');

  // 2. Deletar produtos fictícios
  const rProd = await client.query('DELETE FROM public.produtos;');

  // 3. Deletar clientes fictícios (mantendo apenas o cliente real cadastrado por você, Fatima)
  const rCli = await client.query("DELETE FROM public.clientes WHERE nome != 'Fatima';");

  console.log('Cobranças deletadas:', rCob.rowCount);
  console.log('Vendas deletadas:', rVen.rowCount);
  console.log('Produtos deletados:', rProd.rowCount);
  console.log('Clientes fictícios deletados:', rCli.rowCount);

  // Verificação
  const clientesRestantes = await client.query('SELECT id, nome, whatsapp FROM public.clientes;');
  console.log('Clientes restantes:', clientesRestantes.rows);

  const produtosRestantes = await client.query('SELECT count(*) FROM public.produtos;');
  console.log('Produtos restantes:', produtosRestantes.rows[0].count);

  await client.end();
}

run().catch(console.error);
