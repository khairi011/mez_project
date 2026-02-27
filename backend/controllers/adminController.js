const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { handleAsync } = require('../middleware/errorHandler');

// Get all orders (ADMIN)
exports.getAllOrders = handleAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 20;

  const orders = await Order.findAll(page, limit);
  const total = await Order.count();

  res.json({
    success: true,
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Update order status (ADMIN)
exports.updateOrderStatus = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['EN_ATTENTE', 'CONFIRMEE', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  await Order.updateStatus(id, status);
  const updated = await Order.findByIdWithDetails(id);

  // Send email notification
  if (updated.deliveryInfo) {
    await emailService.sendOrderStatusUpdate(updated, updated.deliveryInfo);
  }

  res.json({
    success: true,
    message: 'Order status updated',
    order: updated,
  });
});

// Get dashboard stats (ADMIN)
exports.getDashboardStats = handleAsync(async (req, res) => {
  const orderStats = await Order.getStats();
  const totalUsers = await User.count();
  const totalProducts = await Product.count();
  const totalCategories = await Category.findAll();

  res.json({
    success: true,
    stats: {
      orders: orderStats,
      users: totalUsers,
      products: totalProducts,
      categories: totalCategories.length,
    },
  });
});

// Get orders by status (ADMIN)
exports.getOrdersByStatus = handleAsync(async (req, res) => {
  const { status } = req.params;

  const validStatuses = ['EN_ATTENTE', 'CONFIRMEE', 'EXPEDIEE', 'LIVREE', 'ANNULEE'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }

  const orders = await Order.findByStatus(status);

  res.json({
    success: true,
    status,
    orders,
    count: orders.length,
  });
});

// Get all users (ADMIN)
exports.getAllUsers = handleAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 20;

  const users = await User.findAll(page, limit);
  const total = await User.count();

  res.json({
    success: true,
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Delete user (ADMIN)
exports.deleteUser = handleAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  await User.delete(id);

  res.json({
    success: true,
    message: 'User deleted',
  });
});