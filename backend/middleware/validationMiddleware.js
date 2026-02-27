// backend/middleware/validationMiddleware.js

const { body, validationResult, param } = require('express-validator');

// Get validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Register validation
exports.validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be 6-100 characters'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  validate,
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('password')
    .notEmpty()
    .withMessage('Password required'),
  validate,
];

// Product create validation
exports.validateProductCreate = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Name must be 3-255 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be > 0'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be >= 0'),
  body('categoryId')
    .isInt()
    .withMessage('Invalid category ID'),
  validate,
];

// Delivery info validation ⭐ IMPORTANT
exports.validateDeliveryInfo = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Zàâäéèêëïîôöùûüœæç\s'-]+$/)
    .withMessage('First name contains invalid characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Zàâäéèêëïîôöùûüœæç\s'-]+$/)
    .withMessage('Last name contains invalid characters'),
  
  body('phoneNumber')
    .trim()
    .matches(/^(?:\+33|0)[1-9]\d{8}$/)
    .withMessage('Invalid phone number (ex: +33612345678)'),
  
  body('fullAddress')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be 10-200 characters'),
  
  body('city')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be 2-100 characters'),
  
  body('zipCode')
    .optional({ checkFalsy: true })
    .matches(/^\d{5}$|^$/)
    .withMessage('Zip code must be 5 digits'),
  
  validate,
];

// Create order validation
exports.validateCreateOrder = [
  body('cartId')
    .isInt()
    .withMessage('Invalid cart ID'),
  body('deliveryInfo')
    .notEmpty()
    .withMessage('Delivery info required'),
  validate,
];

// Add to cart validation
exports.validateAddToCart = [
  body('productId')
    .isInt()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be >= 1'),
  validate,
];

// Product update validation
exports.validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Name must be 3-255 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be > 0'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be >= 0'),
  body('categoryId')
    .optional()
    .isInt()
    .withMessage('Invalid category ID'),
  validate,
];

// ID parameter validation
exports.validateIdParam = [
  param('id')
    .isInt()
    .withMessage('Invalid ID'),
  validate,
];