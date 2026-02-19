const pool = require('../config/database');

class Category {
  static async create(categoryData) {
    const { name, description } = categoryData;
    const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    const [result] = await pool.execute(query, [name, description]);
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const query = 'SELECT id, name, description, created_at FROM categories WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  static async findAll() {
    const query = 'SELECT id, name, description, created_at FROM categories ORDER BY name';
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async findByName(name) {
    const query = 'SELECT id, name, description FROM categories WHERE name = ?';
    const [rows] = await pool.execute(query, [name]);
    return rows[0] || null;
  }

  static async update(id, categoryData) {
    const { name, description } = categoryData;
    const query = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
    await pool.execute(query, [name, description, id]);
    return this.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM categories WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async existsByName(name) {
    const query = 'SELECT id FROM categories WHERE name = ?';
    const [rows] = await pool.execute(query, [name]);
    return rows.length > 0;
  }
}

module.exports = Category;