const pool = require('../config/database');

class Product {
  // Get all products (paginated)
  static async findAll(page = 0, limit = 12) {
    const offset = page * limit;
    const query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock, p.image_url,
        p.category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute(query, [limit, offset]);
    return rows;
  }

  // Find product by ID
  static async findById(id) {
    const query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock, p.image_url,
        p.category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  // Find products by category (paginated)
  static async findByCategory(categoryId, page = 0, limit = 12) {
    const offset = page * limit;
    const query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock, p.image_url,
        p.category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute(query, [categoryId, limit, offset]);
    return rows;
  }

  // Get available products
  static async findAvailable(limit = 10) {
    const query = `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock, p.image_url,
        p.category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock > 0
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    const [rows] = await pool.execute(query, [limit]);
    return rows;
  }

  // Create product
  static async create(productData) {
    const { name, description, price, stock, imageUrl, categoryId } = productData;
    const query = 'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [name, description || null, price, stock || 0, imageUrl || null, categoryId]);
    return this.findById(result.insertId);
  }

  // Update product
  static async update(id, productData) {
    const { name, description, price, stock, imageUrl, categoryId } = productData;
    const query = `
      UPDATE products SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        stock = COALESCE(?, stock),
        image_url = COALESCE(?, image_url),
        category_id = COALESCE(?, category_id)
      WHERE id = ?
    `;
    await pool.execute(query, [name, description, price, stock, imageUrl, categoryId, id]);
    return this.findById(id);
  }

  // Delete product
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Update stock (positive = add, negative = subtract)
  static async updateStock(productId, quantityChange) {
    const query = 'UPDATE products SET stock = stock + ? WHERE id = ?';
    await pool.execute(query, [quantityChange, productId]);
  }

  // Count total products
  static async count() {
    const query = 'SELECT COUNT(*) as count FROM products';
    const [rows] = await pool.execute(query);
    return rows[0].count;
  }

  // Search products by name or description
  static async search(query, page = 0, limit = 12) {
    const offset = page * limit;
    const sqlQuery = `
      SELECT 
        p.id, p.name, p.description, p.price, p.stock, p.image_url,
        p.category_id, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.name LIKE ? OR p.description LIKE ?
      LIMIT ? OFFSET ?
    `;
    const searchQuery = `%${query}%`;
    const [rows] = await pool.execute(sqlQuery, [searchQuery, searchQuery, limit, offset]);
    return rows;
  }
}

module.exports = Product;
