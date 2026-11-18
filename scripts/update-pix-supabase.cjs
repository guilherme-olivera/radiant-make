const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Maraccini26%40@db.filsokpyqndkbskwbscn.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const res = await client.query(`
    UPDATE public.configuracoes_loja
    SET chave_pix = '220.676.908-50',
        tipo_chave_pix = 'CPF',
        updated_at = NOW()
    WHERE id = 'config_principal'
    RETURNING *;
  `);
  console.log('Chave Pix atualizada no Supabase:', res.rows[0]);
  await client.end();
}

run().catch(console.error);
