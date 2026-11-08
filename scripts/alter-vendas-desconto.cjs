const { Client } = require('pg');

async function alterTable() {
  const client = new Client({
    host: 'db.filsokpyqndkbskwbscn.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'Maraccini26@',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('Conectado ao Supabase PostgreSQL...');
    await client.query(`
      ALTER TABLE public.vendas ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2);
      ALTER TABLE public.vendas ADD COLUMN IF NOT EXISTS desconto NUMERIC(10,2) DEFAULT 0.00;
    `);
    console.log('✅ Colunas subtotal e desconto adicionadas à tabela vendas no Supabase!');
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

alterTable();
