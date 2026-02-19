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

// Optional authentication
exports.optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractToken(authHeader);

    if (token) {
      const decoded = jwtService.verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
};

// CORS headers
exports.corsHeaders = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};