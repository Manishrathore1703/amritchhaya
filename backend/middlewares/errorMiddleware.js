/**
 * Global Error Handling Middleware & Custom ApiError Class
 * 
 * Educational Note:
 * Custom Error classes allow us to throw descriptive errors anywhere in services or controllers
 * (e.g. `throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND')`) and have a single
 * central middleware catch it and format the HTTP response consistently.
 */

const { sendError } = require('../utils/apiResponse');

class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'SERVER_ERROR', details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express Error Handler Middleware (Must have 4 parameters: err, req, res, next)
 */
function errorHandler(err, req, res, next) {
  console.error(`❌ [Error] ${req.method} ${req.originalUrl}:`, err.message);

  if (err instanceof ApiError) {
    return sendError(res, err.message, err.errorCode, err.statusCode, err.details);
  }

  // Handle unexpected syntax errors / JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'Malformed JSON payload', 'VALIDATION_ERROR', 400);
  }

  // Fallback for unhandled server errors
  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    'SERVER_ERROR',
    500
  );
}

/**
 * 404 Route Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  return sendError(res, `Endpoint ${req.originalUrl} not found`, 'RESOURCE_NOT_FOUND', 404);
}

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler
};
