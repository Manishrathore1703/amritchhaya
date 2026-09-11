/**
 * Yatra Routes
 */

const express = require('express');
const router = express.Router();
const yatraController = require('../controllers/yatraController');

router.get('/yatras', yatraController.getYatras);
router.get('/yatras/:slug', yatraController.getYatraBySlug);
router.post('/yatra-bookings', yatraController.createYatraBooking);

module.exports = router;
