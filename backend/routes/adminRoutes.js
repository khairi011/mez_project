const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');
const { validateIdParam } = require('../middleware/validationMiddleware');

// All admin routes require ADMIN role
// (authenticate + requireAdmin applied in server.js)

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Order management
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', validateIdParam, adminController.updateOrderStatus);
router.get('/orders/status/:status', adminController.getOrdersByStatus);

// User management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', validateIdParam, adminController.deleteUser);

module.exports = router;