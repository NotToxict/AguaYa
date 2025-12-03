require('dotenv').config();
const { Pool } = require('pg');

// Usa directamente la DATABASE_URL de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necesario en muchos servicios cloud (incluido Render)
  },
});

// Opcional: Probar la conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  console.log('Successfully connected to PostgreSQL database!');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};