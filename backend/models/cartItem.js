const pool = require('../config/database');

class CartItem {
  static async create(cartId, productId, quantity) {
    const query = 'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [cartId, productId, quantity]);
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const query = `
      SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity,
             p.id as product_id, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async findByCartAndProduct(cartId, productId) {
    const query = `
      SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity,
             p.id as product_id, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ? AND ci.product_id = ?
    `;
    const [rows] = await pool.execute(query, [cartId, productId]);
    return rows[0] || null;
  }

  static async findByCartId(cartId) {
    const query = `
      SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity,
             p.id as product_id, p.name, p.price, p.image_url, p.stock, p.category_id
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
      ORDER BY ci.id
    `;
    const [rows] = await pool.execute(query, [cartId]);
    return rows;
  }

  static async update(id, quantity) {
    const query = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
    await pool.execute(query, [quantity, id]);
    return this.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM cart_items WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async deleteByProductId(productId) {
    const query = 'DELETE FROM cart_items WHERE product_id = ?';
    const [result] = await pool.execute(query, [productId]);
    return result.affectedRows;
  }
}

module.exports = CartItem;