/**
 * Authentication Business Logic Service
 * 
 * Educational Note on Parameterized Queries:
 * Always use `?` placeholders when executing database queries to prevent SQL Injection attack vectors.
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { ApiError } = require('../middlewares/errorMiddleware');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

/**
 * Admin Login
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required', 'VALIDATION_ERROR');
  }

  // 1. Fetch user from DB using parameterized query
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  
  if (users.length === 0) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const user = users[0];

  // 2. Compare hashed password using bcrypt
  const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // 3. Generate tokens
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // 4. Save refresh token in database
  await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

/**
 * Refresh Access Token
 */
async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required', 'VALIDATION_ERROR');
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? AND refresh_token = ?', [decoded.id, refreshToken]);

    if (users.length === 0) {
      throw new ApiError(401, 'Invalid or revoked refresh token', 'INVALID_TOKEN');
    }

    const user = users[0];
    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token', 'INVALID_TOKEN');
  }
}

/**
 * Logout User
 */
async function logoutUser(userId, refreshToken) {
  await pool.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [userId]);
  return true;
}

module.exports = {
  loginUser,
  refreshAccessToken,
  logoutUser
};
