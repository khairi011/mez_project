class Product {
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
