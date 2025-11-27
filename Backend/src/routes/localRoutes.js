const express = require('express');
const router = express.Router();
const db = require('../config/db');
const admin = require('../config/firebase');

// POST /api/local/employees
// Función: El dueño crea un usuario Repartidor (Delivery)
router.post('/employees', async (req, res) => {
  const { name, email, password, localId } = req.body;

  try {
    // 1. Crear el usuario en FIREBASE (Nube)
    // Usamos el Admin SDK para crearle una cuenta con contraseña
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password, // La contraseña que el dueño le asigne
      displayName: name,
    });

    // 2. Guardarlo en POSTGRESQL (Base de Datos)
    // Lo vinculamos a TU tienda (localId) y le ponemos rol 'delivery'
    const query = `
      INSERT INTO users (firebase_uid, email, name, role, associated_local_id)
      VALUES ($1, $2, $3, 'delivery', $4)
      RETURNING *;
    `;
    
    await db.query(query, [userRecord.uid, email, name, localId]);

    res.json({ 
      ok: true, 
      message: 'Repartidor creado exitosamente',
      uid: userRecord.uid 
    });

  } catch (error) {
    console.error('Error creando empleado:', error);
    // Si el error es que el correo ya existe, avisamos
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ ok: false, error: 'Ese correo ya está registrado.' });
    }
    res.status(500).json({ ok: false, error: 'No se pudo crear el empleado.' });
  }
});

// GET /api/local/employees/:localId
// Función: Ver lista de mis repartidores
router.get('/employees/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const query = `SELECT name, email, phone FROM users WHERE associated_local_id = $1 AND role = 'delivery'`;
    const result = await db.query(query, [localId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo empleados' });
  }
});

module.exports = router;