require('dotenv').config(); // Carga las variables de .env
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'), // Asegúrate de que el puerto sea un número
});

// Opcional: Probar la conexión
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database!');
  release(); // Libera el cliente de vuelta al pool
});

module.exports = {
  query: (text, params) => pool.query(text, params), // Exportamos una función para hacer consultas
  pool, // Exportamos el pool por si se necesita más control
};