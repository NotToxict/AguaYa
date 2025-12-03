const express = require('express');
const router = express.Router();
const db = require('../config/db');
const admin = require('../config/firebase');

// POST /api/auth/sync
// Sincroniza usuario y devuelve su estado real (incluyendo rechazos)
router.post('/sync', async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // Buscamos usuario, estado de tienda y RAZÓN DE RECHAZO
    const userQuery = `
      SELECT u.*, l.verification_status, l.rejection_reason 
      FROM users u
      LEFT JOIN locales l ON u.associated_local_id = l.local_id
      WHERE u.firebase_uid = $1
    `;
    const result = await db.query(userQuery, [uid]);

    let user = result.rows[0];

    if (!user) {
      const insertQuery = `
        INSERT INTO users (firebase_uid, email, name, role, created_at)
        VALUES ($1, $2, $3, 'client', NOW())
        RETURNING *;
      `;
      const insertResult = await db.query(insertQuery, [uid, email, name || 'Usuario']);
      user = insertResult.rows[0];
    }

    res.json({
      ok: true,
      user: {
        uid: user.firebase_uid,
        role: user.role,
        localId: user.associated_local_id,
        name: user.name,
        verificationStatus: user.verification_status || 'approved',
        rejectionReason: user.rejection_reason 
      }
    });
  } catch (error) {
    console.error('❌ Error en Auth Sync:', error.message);
    res.status(401).json({ ok: false, error: 'Token inválido' });
  }
});

// POST /api/auth/register-business
// Registro completo con documentos y ubicación
router.post('/register-business', async (req, res) => {
  const { uid, name, address, phone, lat, lng, documents } = req.body;
  
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Crear Tienda (Pendiente y Desactivada)
    const localQuery = `
      INSERT INTO locales (
        name, address, phone, owner_user_id, is_active, verification_status,
        latitude, longitude
      )
      VALUES ($1, $2, $3, $4, FALSE, 'pending', $5, $6)
      RETURNING local_id;
    `;
    const localRes = await client.query(localQuery, [name, address, phone, uid, lat, lng]);
    const localId = localRes.rows[0].local_id;

    // 2. Actualizar Usuario Y FORZAR ESTADO A PENDING (CORRECCIÓN AQUÍ)
    await client.query(
      `UPDATE users SET role = 'local', associated_local_id = $1, verification_status = 'pending' WHERE firebase_uid = $2`,
      [localId, uid]
    );

    // 3. Guardar Documentos
    if (documents && documents.length > 0) {
      const docQuery = `INSERT INTO local_documents (local_id, document_type, file_url) VALUES ($1, $2, $3)`;
      for (const doc of documents) {
        await client.query(docQuery, [localId, doc.type, doc.url]);
      }
    }

    await client.query('COMMIT');
    res.json({ ok: true, localId, message: 'Solicitud enviada correctamente.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en registro:", error);
    res.status(500).json({ error: 'No se pudo registrar el negocio' });
  } finally {
    client.release();
  }
});

module.exports = router;