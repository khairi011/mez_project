// backend/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/Authmiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  validateProductCreate,
  validateProductUpdate,
  validateIdParam,
} = require('../middleware/validationMiddleware');

// Public routes — specific routes MUST come before parameterized ones
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', validateIdParam, productController.getProductById);

// Admin only — product management (multer before validation to parse multipart/form-data)
router.post('/', authenticate, requireAdmin, upload.single('image'), validateProductCreate, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), validateIdParam, validateProductUpdate, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, validateIdParam, productController.deleteProduct);

module.exports = router;
