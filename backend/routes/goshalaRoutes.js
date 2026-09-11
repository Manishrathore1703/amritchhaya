/**
 * Goshala Routes
 */

const express = require('express');
const router = express.Router();
const goshalaController = require('../controllers/goshalaController');

router.get('/goshala/cows', goshalaController.getCows);

module.exports = router;
