const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/orders
// Crear un nuevo pedido (AHORA CON GPS Y MÉTODO DE PAGO)
router.post('/', async (req, res) => {
  const client = await db.pool.connect(); 
  
  try {
    const { 
      userId, localId, 
      customerName, customerPhone, deliveryAddress, notes,
      subtotal, deliveryFee, total,
      items,
      // 👇 DATOS NUEVOS QUE FALTABAN:
      deliveryLat, deliveryLng, paymentMethod 
    } = req.body;

    await client.query('BEGIN');

    // 2. Insertar la ORDEN con coordenadas
    const orderQuery = `
      INSERT INTO orders (
        user_id, local_id, 
        customer_name, customer_phone, delivery_address, notes,
        subtotal, delivery_fee, total,
        status,
        delivery_lat, delivery_lng, payment_method
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, $12)
      RETURNING order_id;
    `;
    
    // Aseguramos que si no hay coordenadas, se guarde NULL
    const orderValues = [
      userId, localId, 
      customerName, customerPhone, deliveryAddress, notes || '',
      subtotal, deliveryFee, total,
      deliveryLat || null, 
      deliveryLng || null, 
      paymentMethod || 'cash'
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].order_id;

    // 3. Insertar ITEMS
    const itemQuery = `
      INSERT INTO order_items (
        order_id, product_id, quantity, 
        price_at_order, product_name_at_order, product_size_at_order
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const item of items) {
      await client.query(itemQuery, [
        orderId, 
        item.id, 
        item.qty, 
        item.price, 
        item.name, 
        item.size
      ]);
    }

    await client.query('COMMIT');

    res.json({ ok: true, orderId, message: 'Pedido creado exitosamente' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando orden:', error);
    res.status(500).json({ ok: false, error: 'Error al procesar el pedido' });
  } finally {
    client.release();
  }
});

// GET /api/orders/user/:uid
// Ver mis pedidos
router.get('/user/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const query = `
      SELECT o.*, l.name as local_name 
      FROM orders o
      JOIN locales l ON o.local_id = l.local_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    const result = await db.query(query, [uid]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo pedidos' });
  }
});

module.exports = router;