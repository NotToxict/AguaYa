const express = require('express');
const router = express.Router();
const db = require('../config/db');
const admin = require('../config/firebase');

// ==========================================
// 🛵 GESTIÓN DE EMPLEADOS (REPARTIDORES)
// ==========================================

// POST /api/local/employees
// Función: El dueño crea un usuario Repartidor (Delivery)
router.post('/employees', async (req, res) => {
  const { name, email, password, localId } = req.body;

  try {
    // 1. Crear el usuario en FIREBASE (Nube)
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password, // La contraseña que el dueño le asigne
      displayName: name,
    });

    // 2. Guardarlo en POSTGRESQL (Base de Datos)
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

// ==========================================
// 📦 GESTIÓN DE PRODUCTOS (CATÁLOGO)
// ==========================================

// POST /api/local/products
// Crear un nuevo producto (Con imagen e inventario)
router.post('/products', async (req, res) => {
  const { name, description, price, size, imageUrl, inventory, localId } = req.body;
  
  try {
    const query = `
      INSERT INTO products (local_id, name, description, price, size, image_url, inventory_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    // Si inventory viene vacío, ponemos 0 por defecto
    const result = await db.query(query, [
      localId, name, description, price, size, imageUrl, inventory || 0
    ]);
    
    res.json({ ok: true, product: result.rows[0] });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ ok: false, error: 'No se pudo guardar el producto' });
  }
});

// DELETE /api/local/products/:id
// Borrar un producto (Desactivación lógica)
router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE products SET is_active = FALSE WHERE product_id = $1', [id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error borrando producto' });
  }
});

// ==========================================
// 📋 GESTIÓN DE PEDIDOS (DASHBOARD)
// ==========================================

// GET /api/local/orders/:localId
// Ver pedidos activos (Pendientes, Aceptados, Preparando, En Ruta)
router.get('/orders/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const query = `
      SELECT 
        o.order_id, o.customer_name, o.customer_phone, o.delivery_address, 
        o.total, o.status, o.created_at, o.notes,
        json_agg(json_build_object(
          'name', oi.product_name_at_order, 
          'qty', oi.quantity,
          'size', oi.product_size_at_order
        )) as items
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.local_id = $1 
      AND o.status NOT IN ('delivered', 'cancelled') -- Solo pedidos activos
      GROUP BY o.order_id
      ORDER BY o.created_at ASC
    `;
    
    const result = await db.query(query, [localId]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// PUT /api/local/orders/:orderId/status
// Cambiar estado del pedido
router.put('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; 

  try {
    await db.query('UPDATE orders SET status = $1 WHERE order_id = $2', [status, orderId]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

// ==========================================
// 💰 HISTORIAL Y VENTAS
// ==========================================

// GET /api/local/history/:localId
// Ver historial de pedidos entregados y total de ventas
router.get('/history/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    // 1. Obtener lista de pedidos entregados
    const ordersQuery = `
      SELECT order_id, customer_name, total, delivered_at, status
      FROM orders 
      WHERE local_id = $1 
      AND status = 'delivered'
      ORDER BY delivered_at DESC
      LIMIT 50
    `;
    const ordersRes = await db.query(ordersQuery, [localId]);

    // 2. Calcular venta total histórica
    const totalQuery = `
      SELECT SUM(total) as total_sales
      FROM orders 
      WHERE local_id = $1 AND status = 'delivered'
    `;
    const totalRes = await db.query(totalQuery, [localId]);

    res.json({
      orders: ordersRes.rows,
      totalSales: totalRes.rows[0].total_sales || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

module.exports = router;