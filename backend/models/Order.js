// backend/models/Order.js

const pool = require('../config/database');

class Order {
  // Create new order
  static async create(orderData) {
    const { userId, totalPrice, status = 'EN_ATTENTE' } = orderData;
    
    const query = 'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [userId || null, totalPrice, status]);
    
    return result.insertId;
  }

  // Find order by ID
  static async findById(id) {
    const query = `
      SELECT 
        o.id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at
      FROM orders o
      WHERE o.id = ?
    `;
    
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  // Find order by ID with all details (items + delivery info)
  static async findByIdWithDetails(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get order
      const [orderRows] = await connection.execute(
        `SELECT o.id, o.user_id, o.total_price, o.status, o.created_at, o.updated_at
         FROM orders o WHERE o.id = ?`,
        [id]
      );

      if (!orderRows.length) return null;

      const order = orderRows[0];

      // Get order items
      const [itemRows] = await connection.execute(
        `SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.price
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [id]
      );

      // Get delivery info
      const [deliveryRows] = await connection.execute(
        `SELECT id, first_name, last_name, phone_number, full_address, city, zip_code
         FROM delivery_info WHERE order_id = ?`,
        [id]
      );

      await connection.commit();

      return {
        ...order,
        items: itemRows,
        deliveryInfo: deliveryRows[0] || null,
      };
    } finally {
      connection.release();
    }
  }

  // Find orders by user ID
  static async findByUserId(userId, page = 0, limit = 10) {
    const offset = page * limit;
    const query = `
      SELECT id, user_id, total_price, status, created_at, updated_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await pool.execute(query, [userId, limit, offset]);
    return rows;
  }

  // Get all orders (admin)
  static async findAll(page = 0, limit = 20) {
    const offset = page * limit;
    const query = `
      SELECT id, user_id, total_price, status, created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await pool.execute(query, [limit, offset]);
    return rows;
  }

  // Update order status
  static async updateStatus(id, status) {
    const query = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?';
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Find orders by status
  static async findByStatus(status) {
    const query = 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, [status]);
    return rows;
  }

  // Count orders by status
  static async countByStatus(status) {
    const query = 'SELECT COUNT(*) as count FROM orders WHERE status = ?';
    const [rows] = await pool.execute(query, [status]);
    return rows[0].count;
  }

  // Get total revenue (delivered orders)
  static async getTotalRevenue() {
    const query = 'SELECT SUM(total_price) as revenue FROM orders WHERE status = "LIVREE"';
    const [rows] = await pool.execute(query);
    return rows[0].revenue || 0;
  }

  // Count total orders
  static async count() {
    const query = 'SELECT COUNT(*) as count FROM orders';
    const [rows] = await pool.execute(query);
    return rows[0].count;
  }

  // Delete order
  static async delete(id) {
    const query = 'DELETE FROM orders WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get order stats (admin)
  static async getStats() {
    const total = await this.count();
    const enAttente = await this.countByStatus('EN_ATTENTE');
    const confirmee = await this.countByStatus('CONFIRMEE');
    const expediee = await this.countByStatus('EXPEDIEE');
    const livree = await this.countByStatus('LIVREE');
    const revenue = await this.getTotalRevenue();

    return {
      total,
      byStatus: {
        enAttente,
        confirmee,
        expediee,
        livree,
      },
      revenue,
    };
  }
}

module.exports = Order;
