const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { 
  validateAddToCart,
  validateIdParam 
} = require('../middleware/validationMiddleware');

// All cart routes require authentication
// (authenticate middleware is applied in server.js)

// Get cart
router.get('/', cartController.getCart);

// Add to cart
router.post('/items', validateAddToCart, cartController.addToCart);

// Update cart item
router.patch('/items/:cartItemId', validateIdParam, cartController.updateCartItem);

// Remove from cart
router.delete('/items/:cartItemId', validateIdParam, cartController.removeFromCart);

// Clear cart
router.delete('/', cartController.clearCart);

module.exports = router;