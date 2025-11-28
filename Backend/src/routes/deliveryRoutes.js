const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/delivery/pending-orders
// Obtiene pedidos "En Camino" de la tienda a la que pertenece el chofer
router.get('/pending-orders', async (req, res) => {
  const { uid } = req.query; // Recibimos el UID del chofer

  try {
    // 1. Averiguar a qué tienda pertenece este chofer
    const userRes = await db.query('SELECT associated_local_id FROM users WHERE firebase_uid = $1', [uid]);
    
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    const localId = userRes.rows[0].associated_local_id;

    if (!localId) return res.status(400).json({ error: 'No estás vinculado a ninguna tienda' });

    // 2. Buscar pedidos de esa tienda que estén "on_route" (En camino)
    // Nota: Usamos JSON_AGG para agrupar los productos en un array, igual que en el dashboard del dueño
    const ordersQuery = `
      SELECT 
        o.order_id, o.customer_name, o.customer_phone, o.delivery_address, 
        o.total, o.notes, o.status,
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

// PUT /api/delivery/orders/:id/deliver
// Marcar pedido como ENTREGADO
router.put('/orders/:id/deliver', async (req, res) => {
  const { id } = req.params; // ID del pedido
  const { uid } = req.body;  // ID del chofer que lo entregó

  try {
    // Actualizamos estado, fecha de entrega y asignamos al chofer responsable
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

module.exports = router;