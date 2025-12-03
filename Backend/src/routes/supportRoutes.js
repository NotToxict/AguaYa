// Backend/src/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/support
// Recibe el mensaje del formulario y lo guarda en la base de datos
router.post('/', async (req, res) => {
  const { userId, content } = req.body;

  // Validación simple: que no envíen mensajes vacíos
  if (!content) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
  }

  try {
    // Insertamos en la tabla 'suggestions' que ya tienes creada
    const query = `
      INSERT INTO suggestions (user_id, content)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    // Si el usuario no está logueado, userId será null (permitido por tu base de datos)
    await db.query(query, [userId || null, content]);

    res.json({ ok: true, message: 'Mensaje recibido correctamente' });
  } catch (error) {
    console.error('Error guardando sugerencia:', error);
    res.status(500).json({ error: 'Error interno al guardar el mensaje' });
  }
});

module.exports = router;