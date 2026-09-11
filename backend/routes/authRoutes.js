/**
 * Auth Router Definitions
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/login', authController.handleLogin);
router.post('/refresh', authController.handleRefresh);
router.post('/logout', authenticateToken, authController.handleLogout);

module.exports = router;
