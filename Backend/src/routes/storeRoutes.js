const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- Endpoint GET /api/stores ---
// Lista todas las tiendas activas (Para la pantalla principal)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT local_id, name, address, phone, delivery_fee, min_eta_minutes, max_eta_minutes, rating, image_url FROM locales WHERE is_active = TRUE ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// --- Endpoint GET /api/stores/:id ---
// Detalle de UNA tienda (Trae is_active para saber si está cerrada)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(parseInt(id))) return res.status(400).json({ error: 'ID inválido' });

  try {
    // Seleccionamos datos vitales según tu tabla 'locales'
    const query = `
      SELECT local_id, name, address, phone, delivery_fee, 
             min_eta_minutes, max_eta_minutes, rating, is_active 
      FROM locales 
      WHERE local_id = $1
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tienda no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// --- Endpoint GET /api/stores/:id/products ---
// Productos DISPONIBLES (Activos y con Inventario > 0)
router.get('/:id/products', async (req, res) => {
  const { id } = req.params;

  try {
    // REGLA DE NEGOCIO: Solo mostramos productos que se pueden vender
    // is_active = TRUE y inventory_count > 0 (según tu tabla 'products')
    const query = `
      SELECT product_id, name, description, price, size, image_url, inventory_count 
      FROM products 
      WHERE local_id = $1 
      AND is_active = TRUE 
      AND inventory_count > 0 
      ORDER BY name ASC
    `;
    
    const result = await db.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error productos:', err);
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});

module.exports = router;