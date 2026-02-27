// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/Authmiddleware');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;