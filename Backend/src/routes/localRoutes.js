const express = require('express');
const router = express.Router();
const db = require('../config/db');
const admin = require('../config/firebase');

// ==========================================
// 🛵 GESTIÓN DE EMPLEADOS
// ==========================================
router.post('/employees', async (req, res) => {
  const { name, email, password, localId } = req.body;
  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName: name });
    const query = `INSERT INTO users (firebase_uid, email, name, role, associated_local_id) VALUES ($1, $2, $3, 'delivery', $4) RETURNING *`;
    await db.query(query, [userRecord.uid, email, name, localId]);
    res.json({ ok: true, message: 'Repartidor creado', uid: userRecord.uid });
  } catch (error) { res.status(500).json({ ok: false, error: error.message }); }
});

router.get('/employees/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const result = await db.query(`SELECT firebase_uid, name, email, phone, created_at, (SELECT COUNT(*) FROM orders o WHERE o.assigned_repartidor_id = u.firebase_uid AND o.status = 'delivered') as total_deliveries FROM users u WHERE u.associated_local_id = $1 AND u.role = 'delivery'`, [localId]);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: 'Error obteniendo empleados' }); }
});

router.delete('/employees/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    await db.query(`UPDATE users SET role = 'client', associated_local_id = NULL WHERE firebase_uid = $1`, [uid]);
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ error: 'Error borrando empleado' }); }
});

// ==========================================
// 📦 GESTIÓN DE PRODUCTOS
// ==========================================
router.post('/products', async (req, res) => {
  const { name, description, price, size, imageUrl, inventory, localId } = req.body;
  try {
    const query = `INSERT INTO products (local_id, name, description, price, size, image_url, inventory_count) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const result = await db.query(query, [localId, name, description, price, size, imageUrl, inventory || 0]);
    res.json({ ok: true, product: result.rows[0] });
  } catch (error) { res.status(500).json({ ok: false, error: 'Error guardando producto' }); }
});

router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, size, imageUrl, inventory } = req.body;
  try {
    const query = `UPDATE products SET name=$1, description=$2, price=$3, size=$4, image_url=$5, inventory_count=$6, updated_at=NOW() WHERE product_id=$7 RETURNING *`;
    const result = await db.query(query, [name, description, price, size, imageUrl, inventory, id]);
    res.json({ ok: true, product: result.rows[0] });
  } catch (error) { res.status(500).json({ ok: false, error: 'Error actualizando' }); }
});

router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE products SET is_active = FALSE WHERE product_id = $1', [id]);
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ error: 'Error borrando' }); }
});

// ==========================================
// 📋 GESTIÓN DE PEDIDOS (DASHBOARD)
// ==========================================
router.get('/dashboard/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const ordersQuery = `
      SELECT o.order_id, o.customer_name, o.customer_phone, o.delivery_address, o.total, o.status, o.created_at, o.notes,
      json_agg(json_build_object('name', oi.product_name_at_order, 'qty', oi.quantity, 'size', oi.product_size_at_order)) as items
      FROM orders o JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.local_id = $1 AND o.status NOT IN ('delivered', 'cancelled')
      GROUP BY o.order_id ORDER BY o.created_at ASC
    `;
    const ordersRes = await db.query(ordersQuery, [localId]);
    const statsQuery = `SELECT COUNT(*) as today_count, COALESCE(SUM(total), 0) as today_sales FROM orders WHERE local_id = $1 AND status = 'delivered' AND DATE(created_at) = CURRENT_DATE`;
    const statsRes = await db.query(statsQuery, [localId]);
    const localQuery = `SELECT is_active, opening_time, closing_time FROM locales WHERE local_id = $1`;
    const localRes = await db.query(localQuery, [localId]);
    res.json({ orders: ordersRes.rows, stats: statsRes.rows[0], storeStatus: localRes.rows[0] });
  } catch (error) { res.status(500).json({ error: 'Error dashboard' }); }
});

router.put('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; 
  try {
    await db.query('UPDATE orders SET status = $1 WHERE order_id = $2', [status, orderId]);
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ error: 'Error estado' }); }
});

// ==========================================
// ⚙️ CONFIGURACIÓN Y EXTRAS
// ==========================================

// Switch rápido de estado
router.put('/status/:localId', async (req, res) => {
  const { localId } = req.params;
  const { is_active } = req.body;
  try {
    await db.query('UPDATE locales SET is_active = $1 WHERE local_id = $2', [is_active, localId]);
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ error: 'Error estado' }); }
});

router.get('/settings/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const query = `SELECT name, address, phone, delivery_fee, min_eta_minutes, max_eta_minutes, image_url, is_active, opening_time, closing_time FROM locales WHERE local_id = $1`;
    const result = await db.query(query, [localId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tienda no encontrada' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: 'Error config' }); }
});

router.put('/settings/:localId', async (req, res) => {
  const { localId } = req.params;
  const { name, address, phone, delivery_fee, min_eta, max_eta, image_url, is_active, opening_time, closing_time } = req.body;
  try {
    const query = `
      UPDATE locales 
      SET name = $1, address = $2, phone = $3, delivery_fee = $4, min_eta_minutes = $5, max_eta_minutes = $6, 
          image_url = $7, is_active = $8, opening_time = $9, closing_time = $10, updated_at = NOW()
      WHERE local_id = $11 RETURNING *
    `;
    const result = await db.query(query, [name, address, phone, delivery_fee, min_eta, max_eta, image_url, is_active, opening_time, closing_time, localId]);
    res.json({ ok: true, store: result.rows[0] });
  } catch (error) { res.status(500).json({ error: 'Error guardando' }); }
});

router.get('/stats/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const salesQuery = `SELECT TO_CHAR(created_at, 'Dy') as day, SUM(total) as total FROM orders WHERE local_id = $1 AND status = 'delivered' AND created_at > NOW() - INTERVAL '7 days' GROUP BY TO_CHAR(created_at, 'Dy'), DATE(created_at) ORDER BY DATE(created_at) ASC`;
    const salesRes = await db.query(salesQuery, [localId]);
    const lowStockQuery = `SELECT name, inventory_count FROM products WHERE local_id = $1 AND inventory_count < 10 AND is_active = TRUE`;
    const stockRes = await db.query(lowStockQuery, [localId]);
    res.json({ salesData: salesRes.rows, lowStock: stockRes.rows });
  } catch (error) { res.status(500).json({ error: 'Error stats' }); }
});

router.get('/reviews/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const query = `SELECT r.rating, r.comment, r.created_at, u.name as customer_name FROM reviews r JOIN users u ON r.user_id = u.firebase_uid WHERE r.local_id = $1 ORDER BY r.created_at DESC LIMIT 20`;
    const result = await db.query(query, [localId]);
    const avgQuery = `SELECT AVG(rating) as average, COUNT(*) as total FROM reviews WHERE local_id = $1`;
    const avgRes = await db.query(avgQuery, [localId]);
    res.json({ reviews: result.rows, summary: avgRes.rows[0] });
  } catch (error) { res.status(500).json({ error: 'Error reviews' }); }
});

router.post('/suggestions', async (req, res) => {
  const { userId, content } = req.body;
  try {
    await db.query('INSERT INTO suggestions (user_id, content) VALUES ($1, $2)', [userId, content]);
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ error: 'Error suggestion' }); }
});

router.get('/history/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    const ordersRes = await db.query(`SELECT order_id, customer_name, total, delivered_at, status FROM orders WHERE local_id = $1 AND status = 'delivered' ORDER BY delivered_at DESC LIMIT 50`, [localId]);
    const totalRes = await db.query(`SELECT SUM(total) as total_sales FROM orders WHERE local_id = $1 AND status = 'delivered'`, [localId]);
    res.json({ orders: ordersRes.rows, totalSales: totalRes.rows[0].total_sales || 0 });
  } catch (error) { res.status(500).json({ error: 'Error historial' }); }
});

// ==========================================
// 📄 GESTIÓN DE DOCUMENTOS Y RE-VERIFICACIÓN (¡ESTO FALTABA!)
// ==========================================

router.post('/documents', async (req, res) => {
  const { localId, type, url } = req.body;
  try {
    const query = `INSERT INTO local_documents (local_id, document_type, file_url) VALUES ($1, $2, $3) RETURNING *`;
    const result = await db.query(query, [localId, type, url]);
    res.json({ ok: true, document: result.rows[0] });
  } catch (error) {
    console.error('Error docs:', error);
    res.status(500).json({ error: 'Error guardando doc' });
  }
});

router.put('/request-verification/:localId', async (req, res) => {
  const { localId } = req.params;
  try {
    // 1. Actualizar la TIENDA a 'pending' y obtener el ID del dueño
    const result = await db.query(
      "UPDATE locales SET verification_status = 'pending', rejection_reason = NULL WHERE local_id = $1 RETURNING owner_user_id", 
      [localId]
    );

    // 2. Si la tienda se actualizó, actualizamos también al USUARIO a 'pending'
    if (result.rows.length > 0) {
      const ownerId = result.rows[0].owner_user_id;
      await db.query("UPDATE users SET verification_status = 'pending' WHERE firebase_uid = $1", [ownerId]);
    }

    res.json({ ok: true, message: 'Solicitud reenviada y usuario sincronizado' });
  } catch (error) { 
    console.error('Error re-verificación:', error);
    res.status(500).json({ error: 'Error solicitud' }); 
  }
});

module.exports = router;