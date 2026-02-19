const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { 
  validateProductCreate,
  validateIdParam 
} = require('../middleware/validationMiddleware');

// Product routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', validateIdParam, productController.getProductById);

// ADMIN only - Product management
router.post('/', authenticate, requireAdmin, validateProductCreate, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, validateProductCreate, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, validateIdParam, productController.deleteProduct);

// Category routes
router.get('/category/:categoryId', productController.getProductsByCategory);

// Category management (ADMIN)
router.get('/categories/list', categoryController.getAllCategories);
router.post('/categories', authenticate, requireAdmin, categoryController.createCategory);

module.exports = router;