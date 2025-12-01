const { Pool } = require('pg');
require('dotenv').config();

// LÓGICA INTELIGENTE:
// Si existe DATABASE_URL (Railway), úsala con configuración SSL.
// Si no, usa las variables sueltas (Tu PC).

const connectionConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL, 
      ssl: { rejectUnauthorized: false } // <--- ¡ESTO ES CRÍTICO PARA LA NUBE!
    }
  : { 
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_DATABASE || 'aguaya_db',
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
    };

const pool = new Pool(connectionConfig);

pool.on('connect', () => {
  console.log('🐘 Conectado a PostgreSQL exitosamente');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};