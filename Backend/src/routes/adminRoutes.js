const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/admin/pending-stores
// Ver lista de tiendas que están esperando aprobación
router.get('/pending-stores', async (req, res) => {
  try {
    // Traemos datos del local y del dueño para saber a quién aprobamos
    const query = `
      SELECT l.local_id, l.name, l.address, l.phone, l.created_at, 
             u.name as owner_name, u.email as owner_email
      FROM locales l
      JOIN users u ON l.owner_user_id = u.firebase_uid
      WHERE l.verification_status = 'pending'
      ORDER BY l.created_at ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar tiendas pendientes' });
  }
});

// PUT /api/admin/approve-store/:id
// Dar el Visto Bueno (Activar tienda)
router.put('/approve-store/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Cambiamos estado a 'approved' y activamos la tienda (is_active = TRUE)
    const query = `
      UPDATE locales 
      SET verification_status = 'approved', is_active = TRUE 
      WHERE local_id = $1
    `;
    await db.query(query, [id]);
    
    res.json({ ok: true, message: 'Tienda aprobada y activada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aprobar tienda' });
  }
});

module.exports = router;