const express = require('express');
const router = express.Router();
const db = require('../config/db');
const admin = require('../config/firebase');

// POST /api/auth/sync
// Sincroniza el usuario de Firebase con PostgreSQL al iniciar sesión
router.post('/sync', async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Validar token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // 2. Buscar usuario en Postgres
    const userQuery = 'SELECT * FROM users WHERE firebase_uid = $1';
    const result = await db.query(userQuery, [uid]);

    let user = result.rows[0];

    // 3. Si no existe, crearlo como CLIENTE por defecto
    if (!user) {
      console.log(`✨ Creando usuario nuevo: ${email}`);
      const insertQuery = `
        INSERT INTO users (firebase_uid, email, name, role, created_at)
        VALUES ($1, $2, $3, 'client', NOW())
        RETURNING *;
      `;
      const insertResult = await db.query(insertQuery, [uid, email, name || 'Usuario']);
      user = insertResult.rows[0];
    }

    // 4. Responder al Frontend con el ROL y datos
    res.json({
      ok: true,
      user: {
        uid: user.firebase_uid,
        role: user.role,
        localId: user.associated_local_id,
        name: user.name
      }
    });

  } catch (error) {
    console.error('❌ Error en Auth Sync:', error.message);
    res.status(401).json({ ok: false, error: 'Token inválido' });
  }
});

// POST /api/auth/register-business
// Convierte un usuario normal en DUEÑO y crea su tienda (Estado Pendiente)
router.post('/register-business', async (req, res) => {
  const { uid, name, address, phone } = req.body;
  
  const client = await db.pool.connect(); // Usamos cliente para transacción
  
  try {
    await client.query('BEGIN');

    // 1. Crear la Tienda (Nace DESACTIVADA y PENDIENTE)
    const localQuery = `
      INSERT INTO locales (name, address, phone, owner_user_id, is_active, verification_status)
      VALUES ($1, $2, $3, $4, FALSE, 'pending')
      RETURNING local_id;
    `;
    const localRes = await client.query(localQuery, [name, address, phone, uid]);
    const localId = localRes.rows[0].local_id;

    // 2. Actualizar al Usuario (Darle rol de Jefe y vincular tienda)
    const userQuery = `
      UPDATE users 
      SET role = 'local', associated_local_id = $1
      WHERE firebase_uid = $2
    `;
    await client.query(userQuery, [localId, uid]);

    await client.query('COMMIT');
    
    res.json({ ok: true, localId, message: 'Tienda registrada. Esperando aprobación.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registrando negocio:', error);
    res.status(500).json({ error: 'No se pudo registrar el negocio' });
  } finally {
    client.release();
  }
});

module.exports = router;