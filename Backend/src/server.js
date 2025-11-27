require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar configuraciones
const db = require('./config/db');
const admin = require('./config/firebase');

// --- Importar Rutas ---
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');
const localRoutes = require('./routes/localRoutes'); // <--- La de empleados

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors()); // Permite conexiones externas
app.use(express.json()); // Permite leer JSON en las peticiones
app.use(express.urlencoded({ extended: true }));

// --- Ruta de Prueba (Ping) ---
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'Servidor AguaYa funcionando 💧' });
});

// --- Rutas de la API ---
app.use('/api/stores', storeRoutes); // Catálogo de tiendas
app.use('/api/auth', authRoutes);    // Login y Sincronización
app.use('/api/local', localRoutes);  // Dashboard Dueño (Empleados)

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});