const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// 🛍️ RUTAS PÚBLICAS (CLIENTE)
// ==========================================

// GET /api/promos/active
// Obtener banners activos para el Carrusel del Home
router.get('/active', async (req, res) => {
  try {
    const query = `
      SELECT p.promo_id, p.image_url, p.title, p.description, l.name as local_name, l.local_id
      FROM promotions p
      JOIN locales l ON p.local_id = l.local_id
      WHERE p.status = 'active' 
      AND p.end_date > NOW() -- Solo vigentes
      ORDER BY p.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando promociones' });
  }
});

// ==========================================
// 🏪 RUTAS DE DUEÑO (LOCAL)
// ==========================================

// POST /api/promos
// Solicitar una nueva promoción
router.post('/', async (req, res) => {
  const { localId, title, description, imageUrl } = req.body;
  try {
    const query = `
      INSERT INTO promotions (local_id, title, description, image_url, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `;
    const result = await db.query(query, [localId, title, description, imageUrl]);
    res.json({ ok: true, promo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error creando solicitud' });
  }
});

// GET /api/promos/local/:localId
// Ver historial de mis promociones (y sus estados)
router.get('/local/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM promotions WHERE local_id = $1 ORDER BY created_at DESC', 
      [localId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

// ==========================================
// 👮‍♂️ RUTAS DE ADMIN (SUPER USUARIO)
// ==========================================

// GET /api/promos/pending
// Ver solicitudes pendientes de aprobación
router.get('/pending', async (req, res) => {
  try {
    const query = `
      SELECT p.*, l.name as local_name 
      FROM promotions p
      JOIN locales l ON p.local_id = l.local_id
      WHERE p.status = 'pending'
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando solicitudes' });
  }
});

// PUT /api/promos/:id/approve
// Aprobar promoción por X días
router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { days } = req.body; // Cuántos días va a durar (ej: 7)

  try {
    const query = `
      UPDATE promotions 
      SET status = 'active', 
          start_date = NOW(), 
          end_date = NOW() + INTERVAL '${days || 7} days'
      WHERE promo_id = $1
      RETURNING *
    `;
    await db.query(query, [id]);
    res.json({ ok: true, message: 'Promoción aprobada y activada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar' });
  }
});

// PUT /api/promos/:id/reject
// Rechazar promoción
router.put('/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE promotions SET status = 'rejected' WHERE promo_id = $1", [id]);
    res.json({ ok: true, message: 'Promoción rechazada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar' });
  }
});

module.exports = router;