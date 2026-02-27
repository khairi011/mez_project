const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/Authmiddleware');
const { validateIdParam } = require('../middleware/validationMiddleware');

// All admin routes require ADMIN role
// (authenticate + requireAdmin applied in server.js)

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// Order management
router.get('/orders', adminController.getAllOrders);
router.get('/orders/status/:status', adminController.getOrdersByStatus);
router.get('/orders/:id', validateIdParam, adminController.getOrderById);
router.patch('/orders/:id/status', validateIdParam, adminController.updateOrderStatus);

// User management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', validateIdParam, adminController.deleteUser);

module.exports = router;