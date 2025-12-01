const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/reviews
// Cliente califica una orden
router.post('/', async (req, res) => {
  const { orderId, localId, userId, rating, comment } = req.body;
  
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Guardar la reseña
    const insertQuery = `
      INSERT INTO reviews (order_id, local_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    await client.query(insertQuery, [orderId, localId, userId, rating, comment]);

    // 2. Recalcular el promedio de la tienda
    const avgQuery = `
      SELECT AVG(rating) as new_rating 
      FROM reviews 
      WHERE local_id = $1
    `;
    const avgRes = await client.query(avgQuery, [localId]);
    const newRating = parseFloat(avgRes.rows[0].new_rating).toFixed(1);

    // 3. Actualizar la tabla de locales
    await client.query('UPDATE locales SET rating = $1 WHERE local_id = $2', [newRating, localId]);

    await client.query('COMMIT');
    res.json({ ok: true, newRating });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al guardar reseña' });
  } finally {
    client.release();
  }
});

// GET /api/reviews/local/:localId
// Dueño ve sus reseñas
router.get('/local/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const query = `
      SELECT r.rating, r.comment, r.created_at, u.name as customer_name
      FROM reviews r
      JOIN users u ON r.user_id = u.firebase_uid
      WHERE r.local_id = $1
      ORDER BY r.created_at DESC
      LIMIT 20
    `;
    const result = await db.query(query, [localId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo reseñas' });
  }
});

module.exports = router;