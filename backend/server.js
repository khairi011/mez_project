// backend/server.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
require('dotenv').config();

const pool = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { corsHeaders, authenticate, requireAdmin } = require('./middleware/authMiddleware');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// ====== MIDDLEWARE ======
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(corsHeaders);

// ====== ROUTES ======
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server running ✅', timestamp: new Date() });
});
// TEST ROUTE - Check database connection
app.get('/api/test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users LIMIT 5');
    connection.release();
    res.json({
      status: '✅ Database Connected!',
      usersCount: users.length,
      sampleUsers: users,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: '❌ Database Error',
      error: error.message,
      timestamp: new Date()
    });
  }
});
// API Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/categories', require('./routes/categoryRoutes'));
app.use('/cart', authenticate, require('./routes/cartRoutes'));
app.use('/orders', authenticate, require('./routes/orderRoutes'));
app.use('/admin', authenticate, requireAdmin, require('./routes/adminRoutes'));

// ====== ERROR HANDLING ======
app.use(notFound);
app.use(errorHandler);

// ====== SERVER ======
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════╗
  ║   🚀 E-COMMERCE API RUNNING 🚀   ║
  ╠═══════════════════════════════════╣
  ║  Port: ${PORT}                         ║
  ║  URL:  http://localhost:${PORT}       ║
  ║  Env:  ${process.env.NODE_ENV || 'development'}      ║
  ╚═══════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Error:', err);
  process.exit(1);
});

module.exports = app;
