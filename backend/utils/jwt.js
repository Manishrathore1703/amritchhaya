/**
 * JSON Web Token (JWT) Helper Utilities
 * 
 * Educational Note on JWT:
 * JWT consists of three parts separated by dots: Header.Payload.Signature
 * It allows the server to verify the caller's identity without storing session state in memory.
 */

const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key';

/**
 * Generate Access Token (Short lived - e.g. 1 hour)
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h'
  });
}

/**
 * Generate Refresh Token (Long lived - e.g. 7 days)
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
}

/**
 * Verify Access Token
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

/**
 * Verify Refresh Token
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
