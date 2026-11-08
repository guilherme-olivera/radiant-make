const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('Iniciando conexão com Supabase PostgreSQL...');
  
  // Test connection directly with host, user, password
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
    console.log('✅ Conectado com sucesso ao Supabase PostgreSQL!');

    const sqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executando script supabase_schema.sql...');
    await client.query(sql);

    console.log('🎉 Migração concluída com sucesso!');
    
    // Test a simple query to confirm tables exist
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('Tabelas existentes no banco:');
    console.log(res.rows.map(r => r.table_name).join(', '));

  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
    if (err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT')) {
      console.log('Tentando via Session Pooler...');
    }
  } finally {
    await client.end().catch(() => {});
  }
}

runMigration();
