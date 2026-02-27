const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const { name, email, password, role = 'CLIENT' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(query, [name, email, hashedPassword, role]);

    return {
      id: result.insertId,
      name,
      email,
      role,
    };
  }

  // Find user by ID (without password)
  static async findById(id) {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  // Find user by email (without password)
  static async findByEmail(email) {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  // Find user by email WITH password (for login)
  static async findByEmailWithPassword(email) {
    const query = 'SELECT id, name, email, password, role FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Check if email exists
  static async existsByEmail(email) {
    const query = 'SELECT id FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows.length > 0;
  }

  // Update user profile
  static async update(id, userData) {
    const { name, email } = userData;
    const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    await pool.execute(query, [name, email, id]);
    return this.findById(id);
  }

  // Get all users (paginated)
  static async findAll(page = 0, limit = 20) {
    const offset = page * limit;
    const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.execute(query, [limit, offset]);
    return rows;
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get all admin users
  static async findAdmins() {
    const query = 'SELECT id, name, email FROM users WHERE role = "ADMIN"';
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Count total users
  static async count() {
    const query = 'SELECT COUNT(*) as count FROM users';
    const [rows] = await pool.execute(query);
    return rows[0].count;
  }
}

module.exports = User;