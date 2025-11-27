const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/orders
// Recibe el carrito y datos del cliente para crear la orden
router.post('/', async (req, res) => {
  // Extraemos pool para usar transacciones (BEGIN, COMMIT, ROLLBACK)
  const client = await db.pool.connect(); 
  
  try {
    const { 
      userId, localId, 
      customerName, customerPhone, deliveryAddress, notes,
      subtotal, deliveryFee, total,
      items 
    } = req.body;

    // 1. Iniciar Transacción (Modo seguro)
    await client.query('BEGIN');

    // 2. Insertar la ORDEN (Encabezado)
    const orderQuery = `
      INSERT INTO orders (
        user_id, local_id, 
        customer_name, customer_phone, delivery_address, notes,
        subtotal, delivery_fee, total,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING order_id;
    `;
    
    const orderValues = [
      userId, localId, 
      customerName, customerPhone, deliveryAddress, notes || '',
      subtotal, deliveryFee, total
    ];

    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].order_id;

    // 3. Insertar los ITEMS (Detalle)
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

    // 4. Confirmar Transacción (Guardar todo)
    await client.query('COMMIT');

    res.json({ ok: true, orderId, message: 'Pedido creado exitosamente' });

  } catch (error) {
    // Si algo falla, deshacer todo (Rollback)
    await client.query('ROLLBACK');
    console.error('Error creando orden:', error);
    res.status(500).json({ ok: false, error: 'Error al procesar el pedido' });
  } finally {
    client.release(); // Liberar conexión
  }
});

// GET /api/orders/user/:uid
// Ver mis pedidos (Para el cliente)
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