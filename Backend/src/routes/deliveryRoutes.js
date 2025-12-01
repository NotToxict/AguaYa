const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ==========================================
// 🛵 RUTAS DEL REPARTIDOR
// ==========================================

// GET /api/delivery/pending-orders
// Obtiene pedidos "En Camino" asignados a la tienda del chofer
router.get('/pending-orders', async (req, res) => {
  const { uid } = req.query; 

  try {
    // 1. Averiguar a qué tienda pertenece este chofer
    const userRes = await db.query('SELECT associated_local_id FROM users WHERE firebase_uid = $1', [uid]);
    
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const localId = userRes.rows[0].associated_local_id;

    if (!localId) return res.status(400).json({ error: 'No estás vinculado a ninguna tienda' });

    // 2. Buscar pedidos "on_route"
    const ordersQuery = `
      SELECT 
        o.order_id, o.customer_name, o.customer_phone, o.delivery_address, 
        o.total, o.notes, o.status, 
        o.delivery_lat, o.delivery_lng, 
        json_agg(json_build_object('name', oi.product_name_at_order, 'qty', oi.quantity)) as items
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.local_id = $1 
      AND o.status = 'on_route'
      GROUP BY o.order_id
      ORDER BY o.created_at ASC
    `;

    const ordersRes = await db.query(ordersQuery, [localId]);
    res.json(ordersRes.rows);

  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// 🔥 NUEVA RUTA: /arrived (El timbre)
// El chofer avisa que llegó
router.put('/orders/:id/arrived', async (req, res) => {
  const { id } = req.params;
  try {
    // Guardamos la hora exacta de llegada
    await db.query('UPDATE orders SET driver_arrived_at = NOW() WHERE order_id = $1', [id]);
    res.json({ ok: true, message: 'Cliente notificado' });
  } catch (error) {
    console.error('Error notify arrival:', error);
    res.status(500).json({ error: 'No se pudo notificar' });
  }
});

// PUT /api/delivery/orders/:id/deliver
// Marcar pedido como ENTREGADO y COBRADO
router.put('/orders/:id/deliver', async (req, res) => {
  const { id } = req.params; 
  const { uid } = req.body; 

  try {
    const query = `
      UPDATE orders 
      SET status = 'delivered', 
          delivered_at = NOW(),
          assigned_repartidor_id = $1
      WHERE order_id = $2
    `;
    await db.query(query, [uid, id]);
    
    res.json({ ok: true, message: 'Pedido entregado correctamente' });
  } catch (error) {
    console.error('Error marking delivered:', error);
    res.status(500).json({ error: 'No se pudo finalizar el pedido' });
  }
});

// GET /api/delivery/history
// Historial (Para evitar errores si el frontend lo pide)
router.get('/history', async (req, res) => {
  const { uid } = req.query;
  try {
    const query = `
      SELECT order_id, customer_name, delivery_address, total, delivered_at
      FROM orders 
      WHERE assigned_repartidor_id = $1 AND status = 'delivered'
      ORDER BY delivered_at DESC LIMIT 20
    `;
    const result = await db.query(query, [uid]);
    
    const totalQuery = `SELECT SUM(total) as total_collected FROM orders WHERE assigned_repartidor_id = $1 AND status = 'delivered'`;
    const totalRes = await db.query(totalQuery, [uid]);

    res.json({
      history: result.rows,
      totalCollected: totalRes.rows[0].total_collected || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

module.exports = router;