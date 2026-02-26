// backend/config/database.js

const mysql = require('mysql2/promise');
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
});

// Test connection on startup — log only, don't kill the process
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connection successful');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    console.error('⚠️  Check your .env DB credentials and that MySQL is running.');
    // Do NOT exit — let individual requests handle DB errors
  });

module.exports = pool;
