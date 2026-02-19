const User = require('../models/User');
const Cart = require('../models/Cart');
const jwtService = require('../services/jwtService');
const { handleAsync } = require('../middleware/errorHandler');
const pool = require('../config/database');

// Register new user
exports.register = handleAsync(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validate
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords do not match',
    });
  }

  // Check if email exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered',
    });
  }

  // Create user
  const user = await User.create({ name, email, password, role: 'CLIENT' });

  // Create empty cart
  await Cart.create(user.id);

  // Generate tokens
  const { accessToken, refreshToken } = jwtService.generateTokens(
    user.id,
    user.email,
    user.role
  );

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user,
    accessToken,
    refreshToken,
  });
});

// Login user
exports.login = handleAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findByEmailWithPassword(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Verify password
  const passwordMatch = await User.verifyPassword(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = jwtService.generateTokens(
    user.id,
    user.email,
    user.role
  );

  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  });
});

// Get current user profile
exports.getProfile = handleAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.json({
    success: true,
    user,
  });
});

// Logout (client-side removes token)
exports.logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
};