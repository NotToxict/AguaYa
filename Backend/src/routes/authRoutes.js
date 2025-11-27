const express = require('express');
const router = express.Router();
const db = require('../config/db');
const admin = require('../config/firebase');

// POST /api/auth/sync
router.post('/sync', async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Validar token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // 2. Buscar usuario en Postgres (Usando 'firebase_uid')
    const userQuery = 'SELECT * FROM users WHERE firebase_uid = $1';
    const result = await db.query(userQuery, [uid]);

    let user = result.rows[0];

    // 3. Si no existe, crearlo (CORREGIDO: Usamos 'name' en vez de 'full_name')
    if (!user) {
      console.log(`✨ Creando usuario nuevo: ${email}`);
      const insertQuery = `
        INSERT INTO users (firebase_uid, email, name, role, created_at)
        VALUES ($1, $2, $3, 'client', NOW())
        RETURNING *;
      `;
      // Usamos el nombre de Google (name) o 'Usuario' si no viene
      const insertResult = await db.query(insertQuery, [uid, email, name || 'Usuario']);
      user = insertResult.rows[0];
    }

    // 4. Responder al Frontend
    res.json({
      ok: true,
      user: {
        uid: user.firebase_uid,
        role: user.role,
        localId: user.associated_local_id,
        name: user.name // <--- CORREGIDO: Ahora leemos la columna 'name'
      }
    });

  } catch (error) {
    console.error('❌ Error en Auth Sync:', error.message);
    res.status(401).json({ ok: false, error: 'Token inválido' });
  }
});

module.exports = router;