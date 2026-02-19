const pool = require('../config/database');

class Cart {
  static async create(userId) {
    const query = 'INSERT INTO carts (user_id) VALUES (?)';
    const [result] = await pool.execute(query, [userId]);
    return result.insertId;
  }

  static async findById(id) {
    const query = 'SELECT id, user_id, created_at FROM carts WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async findByUserId(userId) {
    const query = 'SELECT id, user_id, created_at FROM carts WHERE user_id = ?';
    const [rows] = await pool.execute(query, [userId]);
    return rows[0] || null;
  }

  static async findOrCreate(userId) {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      const cartId = await this.create(userId);
      cart = await this.findById(cartId);
    }
    return cart;
  }

  static async getTotal(cartId) {
    const query = `
      SELECT COALESCE(SUM(p.price * ci.quantity), 0) as total
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `;
    const [rows] = await pool.execute(query, [cartId]);
    return rows[0].total;
  }

  static async clear(cartId) {
    const query = 'DELETE FROM cart_items WHERE cart_id = ?';
    const [result] = await pool.execute(query, [cartId]);
    return result.affectedRows;
  }

  static async delete(id) {
    const query = 'DELETE FROM carts WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Cart;