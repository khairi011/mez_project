// backend/middleware/authMiddleware.js

const jwtService = require('../services/jwtService');

// Authenticate user - verify JWT token
exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token missing',
      });
    }

    const decoded = jwtService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid token',
    });
  }
};

// Require ADMIN role
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

// Optional authentication — attaches user to req if token is present, silently skips if not
exports.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractToken(authHeader);

    if (token) {
      const decoded = jwtService.verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  optionalAuth token error (ignored):', error.message);
    }
  }

  next();
};