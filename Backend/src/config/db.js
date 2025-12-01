const { Pool } = require('pg');
require('dotenv').config();

// Lógica: Si estamos en la nube (Railway), usa la variable DATABASE_URL.
// Si estamos en local, usa las variables sueltas.
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

const connectionConfig = isProduction
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Vital para Railway/Render
      }
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
  // No matamos el proceso en producción para que intente reconectar
  if (!isProduction) process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};