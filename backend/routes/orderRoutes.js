const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { 
  validateCreateOrder,
  validateIdParam,
  validateDeliveryInfo 
} = require('../middleware/validationMiddleware');

// All routes require authentication
// (authenticate middleware applied in server.js)

// Create order with delivery info ⭐
router.post('/', validateCreateOrder, validateDeliveryInfo, orderController.createOrder);

// Get user's orders
router.get('/', orderController.getMyOrders);

// Get specific order
router.get('/:id', validateIdParam, orderController.getOrderById);

// Cancel order
router.post('/:id/cancel', validateIdParam, orderController.cancelOrder);

module.exports = router;