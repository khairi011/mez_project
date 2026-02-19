// backend/config/database.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'byhn00188',
  database: process.env.DB_NAME || 'mezyena_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connection successful');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });

module.exports = pool;