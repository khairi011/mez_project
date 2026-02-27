const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/Authmiddleware');
const { validateIdParam } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', validateIdParam, categoryController.getCategoryById);

// Route to get subcategories by category ID
router.get('/:id/subcategories', validateIdParam, categoryController.getSubcategoriesByCategoryId);

// ADMIN only
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, validateIdParam, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, validateIdParam, categoryController.deleteCategory);

module.exports = router;