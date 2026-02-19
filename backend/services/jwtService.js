// backend/services/jwtService.js

const jwt = require('jsonwebtoken');

class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key';
    this.expiresIn = process.env.JWT_EXPIRE || '24h';
    this.refreshSecret = process.env.JWT_SECRET + '_refresh';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRE || '7d';
  }

  // Generate access token
  generateAccessToken(userId, email, role) {
    return jwt.sign(
      { id: userId, email, role },
      this.secret,
      { expiresIn: this.expiresIn }
    );
  }

  // Generate refresh token
  generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId },
      this.refreshSecret,
      { expiresIn: this.refreshExpiresIn }
    );
  }

  // Generate both tokens
  generateTokens(userId, email, role) {
    return {
      accessToken: this.generateAccessToken(userId, email, role),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Token invalid or expired');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      throw new Error('Refresh token invalid or expired');
    }
  }

  // Extract token from header
  extractToken(authHeader) {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
    return null;
  }

  // Decode token without verification
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new JwtService();