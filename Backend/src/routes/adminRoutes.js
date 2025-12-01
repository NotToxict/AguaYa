const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// 🏢 GESTIÓN DE TIENDAS (VALIDACIÓN)
// ==========================================

// GET /api/admin/pending-stores
// Lista de tiendas esperando aprobación
router.get('/pending-stores', async (req, res) => {
  try {
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
    res.status(500).json({ error: 'Error cargando tiendas' });
  }
});

// GET /api/admin/store-documents/:localId
// Ver los papeles de una tienda (ORDENADOS POR FECHA)
router.get('/store-documents/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    // CORRECCIÓN IMPORTANTE: ORDER BY uploaded_at DESC
    const query = `
      SELECT * FROM local_documents 
      WHERE local_id = $1 
      ORDER BY uploaded_at DESC
    `;
    const result = await db.query(query, [localId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando documentos' });
  }
});

// PUT /api/admin/approve-store/:id
// Aprobar tienda
router.put('/approve-store/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE locales SET verification_status = 'approved', is_active = TRUE, rejection_reason = NULL WHERE local_id = $1", [id]);
    res.json({ ok: true, message: 'Tienda aprobada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar' });
  }
});

// PUT /api/admin/reject-store/:id
// Rechazar tienda con motivo
router.put('/reject-store/:id', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    await db.query(
      "UPDATE locales SET verification_status = 'rejected', is_active = FALSE, rejection_reason = $1 WHERE local_id = $2", 
      [reason || 'Documentación incompleta', id]
    );
    res.json({ ok: true, message: 'Tienda rechazada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar' });
  }
});

// ==========================================
// 📢 GESTIÓN DE PROMOCIONES (ADS)
// ==========================================

router.get('/pending-promos', async (req, res) => {
  try {
    const query = `
      SELECT p.*, l.name as local_name 
      FROM promotions p
      JOIN locales l ON p.local_id = l.local_id
      WHERE p.status = 'pending'
      ORDER BY p.created_at ASC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando promociones' });
  }
});

router.put('/approve-promo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      UPDATE promotions 
      SET status = 'active', start_date = NOW(), end_date = NOW() + INTERVAL '7 days'
      WHERE promo_id = $1
    `;
    await db.query(query, [id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar promo' });
  }
});

router.put('/reject-promo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE promotions SET status = 'rejected' WHERE promo_id = $1", [id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar promo' });
  }
});

// ==========================================
// 💡 FEEDBACK, FINANZAS Y MAPA
// ==========================================

router.get('/suggestions', async (req, res) => {
  try {
    const query = `
      SELECT s.*, u.name as user_name, u.email as user_email, l.name as store_name
      FROM suggestions s
      JOIN users u ON s.user_id = u.firebase_uid
      LEFT JOIN locales l ON u.associated_local_id = l.local_id
      ORDER BY s.created_at DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error leyendo sugerencias' });
  }
});

router.put('/suggestions/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE suggestions SET status = $1 WHERE suggestion_id = $2', [status, id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando sugerencia' });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const totalQuery = `SELECT SUM(amount) as total_revenue FROM subscriptions WHERE status != 'cancelled'`;
    const totalRes = await db.query(totalQuery);
    
    const listQuery = `
      SELECT s.*, l.name as local_name 
      FROM subscriptions s
      JOIN locales l ON s.local_id = l.local_id
      ORDER BY s.start_date DESC
      LIMIT 50
    `;
    const listRes = await db.query(listQuery);

    res.json({
      totalRevenue: totalRes.rows[0].total_revenue || 0,
      transactions: listRes.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Error financiero' });
  }
});

// Obtener ubicaciones para el mapa de cobertura
router.get('/stores-locations', async (req, res) => {
  try {
    const query = `
      SELECT local_id, name, latitude, longitude, address 
      FROM locales 
      WHERE verification_status = 'approved' AND is_active = TRUE
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando mapa' });
  }
});

module.exports = router;