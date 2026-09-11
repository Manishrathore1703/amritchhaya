/**
 * JWT Authentication & Authorization Middleware
 * 
 * Educational Note:
 * Middlewares in Express execute in sequence.
 * `authenticateToken` validates the Bearer token in headers.
 * `requireRole` ensures only users with specific roles (e.g. SUPER_ADMIN) can access protected endpoints.
 */

const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('./errorMiddleware');

/**
 * Middleware to authenticate requests via JWT Bearer Token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required', 'AUTH_REQUIRED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach user information to request object
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token has expired', 'INVALID_TOKEN'));
    }
    return next(new ApiError(401, 'Invalid access token', 'INVALID_TOKEN'));
  }
}

/**
 * Middleware factory for Role-based Access Control (RBAC)
 * @param  {...string} allowedRoles 
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required', 'AUTH_REQUIRED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Permission denied', 'PERMISSION_DENIED'));
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
