/**
 * Standardized API Response Helper Functions
 * 
 * Enforces consistent JSON formatting across all controllers as specified in api.md:
 * - Success: { success: true, message, data }
 * - Error:   { success: false, message, error: { code, details } }
 */

/**
 * Send Success Response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object|Array} data - Payload data
 * @param {number} statusCode - HTTP status code (Default: 200)
 */
function sendSuccess(res, message = 'Operation successful', data = null, statusCode = 200) {
  const responseBody = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
}

/**
 * Send Error Response
 * @param {Object} res - Express response object
 * @param {string} message - Human readable error message
 * @param {string} errorCode - Machine readable error code (e.g., VALIDATION_ERROR)
 * @param {number} statusCode - HTTP status code (Default: 400)
 * @param {Object} details - Additional error details
 */
function sendError(res, message = 'Something went wrong', errorCode = 'SERVER_ERROR', statusCode = 400, details = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
      details
    }
  });
}

module.exports = {
  sendSuccess,
  sendError
};
