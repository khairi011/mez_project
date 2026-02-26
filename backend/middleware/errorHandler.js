// backend/middleware/errorHandler.js

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err.stack || err.message);
  } else {
    console.error('❌ Error:', err.message);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'This value already exists';
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced resource not found';
  }

  // MySQL access denied
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    statusCode = 500;
    message = 'Database connection error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Route not found
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

// Async wrapper — eliminates try/catch boilerplate in controllers
const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  handleAsync,
};