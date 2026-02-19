const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { validateIdParam } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', validateIdParam, categoryController.getCategoryById);

// ADMIN only
router.post('/', authenticate, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, validateIdParam, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, validateIdParam, categoryController.deleteCategory);

module.exports = router;