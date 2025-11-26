const express = require('express');
const db = require('../config/db'); // Importa la conexión a la BD

const router = express.Router();

// --- Endpoint GET /api/stores ---
// Devuelve la lista de todos los locales activos
router.get('/', async (req, res) => {
  try {
    // Selecciona solo las columnas necesarias para la lista de tiendas
    const result = await db.query(
      'SELECT local_id, name, address, phone, delivery_fee, min_eta_minutes, max_eta_minutes, rating FROM locales WHERE is_active = TRUE ORDER BY name'
    );
    res.json(result.rows); // Envía los resultados como JSON
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ error: 'Error interno del servidor al obtener tiendas.' });
  }
});

// --- Endpoint GET /api/stores/:storeId/products ---
// Devuelve los productos activos de un local específico
router.get('/:storeId/products', async (req, res) => {
  const { storeId } = req.params; // Obtiene el ID de la tienda desde la URL

  // Valida que storeId sea un número (si usaste SERIAL)
  if (isNaN(parseInt(storeId))) {
      return res.status(400).json({ error: 'El ID de la tienda debe ser numérico.' });
  }

  try {
    // Selecciona los productos activos para el local_id especificado
    const result = await db.query(
      'SELECT product_id, name, description, price, size, image_url, inventory_count FROM products WHERE local_id = $1 AND is_active = TRUE ORDER BY name',
      [storeId]
    );

    // Si no se encuentran productos (puede ser normal si la tienda no tiene o el ID es incorrecto)
    // if (result.rows.length === 0) {
    //   // Puedes decidir si devolver un 404 o un array vacío. Un array vacío suele ser mejor.
    //   // return res.status(404).json({ error: 'No se encontraron productos para esta tienda o la tienda no existe.' });
    // }

    res.json(result.rows); // Envía los productos encontrados
  } catch (err) {
    console.error(`Error fetching products for store ${storeId}:`, err);
    res.status(500).json({ error: 'Error interno del servidor al obtener productos.' });
  }
});

module.exports = router; // Exporta el router para usarlo en server.js