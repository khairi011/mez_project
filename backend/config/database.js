// backend/config/database.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,   // no fallback — must be set in .env
  database: process.env.DB_NAME || 'mezyena_db',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
});

// Auto-create tables from schema.sql on startup
async function initDatabase() {
  try {
    // First ensure the database exists (connect without selecting a db)
    const tempConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT) || 3306,
      multipleStatements: true,
    });
    const dbName = process.env.DB_NAME || 'mezyena_db';
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await tempConn.end();

    // Now run schema.sql on the pool (which targets the db)
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      // Remove CREATE DATABASE / USE lines (pool already targets the db)
      const filtered = schema
        .split('\n')
        .filter(line => {
          const trimmed = line.trim().toUpperCase();
          return !trimmed.startsWith('CREATE DATABASE') && !trimmed.startsWith('USE ');
        })
        .join('\n');

      const conn = await pool.getConnection();
      await conn.query(filtered);
      conn.release();
      console.log('✅ Database connection successful');
      console.log('✅ Tables created / verified');
    } else {
      console.log('✅ Database connection successful');
      console.log('⚠️  schema.sql not found — skipping table creation');
    }

    // Seed default users if they don't exist
    await seedDefaultUsers();
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    console.error('⚠️  Check your .env DB credentials and that MySQL is running.');
  }
}

initDatabase();

// Seed default test users on startup
async function seedDefaultUsers() {
  const defaultUsers = [
    { name: 'Admin Mezyena', email: 'admin@mezyena.com', password: 'Admin123!', role: 'ADMIN' },
    { name: 'Client Test', email: 'client@test.com', password: 'Client123!', role: 'CLIENT' },
    { name: 'Sara Dupont', email: 'sara@test.com', password: 'Sara1234!', role: 'CLIENT' },
  ];

  for (const u of defaultUsers) {
    try {
      const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length === 0) {
        const hash = await bcrypt.hash(u.password, 10);
        const [result] = await pool.execute(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [u.name, u.email, hash, u.role]
        );
        await pool.execute('INSERT INTO carts (user_id) VALUES (?)', [result.insertId]);
        console.log(`✅ User created: ${u.email} (${u.role})`);
      }
    } catch (e) {
      // Silently skip duplicates
    }
  }
}

module.exports = pool;
