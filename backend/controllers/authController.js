/**
 * Auth Controller
 * 
 * Express Request/Response Controller handling Auth routes
 */

const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
}

async function handleRefresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    return sendSuccess(res, 'Token refreshed successfully', result, 200);
  } catch (error) {
    next(error);
  }
}

async function handleLogout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(req.user.id, refreshToken);
    return sendSuccess(res, 'Logged out successfully', null, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleLogin,
  handleRefresh,
  handleLogout
};
