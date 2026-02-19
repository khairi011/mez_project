const pool = require('../config/database');

class OrderItem {
  static async create(orderId, productId, quantity, price) {
    const query = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(query, [orderId, productId, quantity, price]);
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const query = `
      SELECT oi.id, oi.order_id, oi.product_id, p.name, oi.quantity, oi.price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async findByOrderId(orderId) {
    const query = `
      SELECT oi.id, oi.order_id, oi.product_id, p.name, oi.quantity, oi.price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `;
    const [rows] = await pool.execute(query, [orderId]);
    return rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM order_items WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async deleteByOrderId(orderId) {
    const query = 'DELETE FROM order_items WHERE order_id = ?';
    const [result] = await pool.execute(query, [orderId]);
    return result.affectedRows;
  }
}

module.exports = OrderItem;