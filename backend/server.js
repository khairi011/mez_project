const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const pool = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { authenticate, requireAdmin } = require('./middleware/Authmiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ====== MIDDLEWARE ======
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ====== ROUTES ======
app.get('/health', (req, res) => {
  res.json({ status: 'Server running ✅', timestamp: new Date() });
});

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

// API Routes — all prefixed with /api
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', authenticate, require('./routes/cartRoutes'));
app.use('/api/orders', authenticate, require('./routes/orderRoutes'));
app.use('/api/admin', authenticate, requireAdmin, require('./routes/adminRoutes'));

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
  console.error('❌ Unhandled Rejection:', err);
  // Do NOT exit — log and keep the server alive
});

module.exports = app;