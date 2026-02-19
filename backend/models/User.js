class User {
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Check if email exists
  static async existsByEmail(email) {
    const query = 'SELECT id FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows.length > 0;
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

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }
}

module.exports = User;