const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/users/:uid
// Obtener perfil completo del usuario
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const query = 'SELECT firebase_uid, email, name, phone, role, default_address, default_payment_method, verification_status FROM users WHERE firebase_uid = $1';
    const result = await db.query(query, [uid]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

// PUT /api/users/:uid
// Actualizar perfil (Nombre, Teléfono, Dirección por defecto)
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { name, phone, default_address, default_payment_method } = req.body;

  try {
    const query = `
      UPDATE users 
      SET name = $1, phone = $2, default_address = $3, default_payment_method = $4, updated_at = NOW()
      WHERE firebase_uid = $5
      RETURNING *
    `;
    const result = await db.query(query, [name, phone, default_address, default_payment_method, uid]);
    
    res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error actualizando perfil' });
  }
});

// GET /api/users/:uid/addresses
// Obtener todas las direcciones guardadas
router.get('/:uid/addresses', async (req, res) => {
  const { uid } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY created_at DESC', 
      [uid]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
});

// POST /api/users/:uid/addresses
// Guardar una nueva dirección en la agenda
router.post('/:uid/addresses', async (req, res) => {
  const { uid } = req.params;
  const { alias, address, lat, lng } = req.body;

  try {
    const query = `
      INSERT INTO user_addresses (user_id, alias, address, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [uid, alias || 'Mi Ubicación', address, lat, lng]);
    res.json({ ok: true, address: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar dirección' });
  }
});

module.exports = router;