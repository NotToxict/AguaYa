require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const admin = require('./config/firebase');

// --- Importar rutas ---
const storeRoutes = require('./routes/storeRoutes'); // <-- Importa las rutas de tiendas

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend de AguaYaa!');
});

// --- Usar las rutas de la API ---
app.use('/api/stores', storeRoutes); // <-- Usa las rutas bajo /api/stores

// TODO: Aquí irán OTRAS rutas (orders, auth, etc.)
// Ejemplo: const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});