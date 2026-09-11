/**
 * Donation Routes
 */

const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.get('/donation-categories', donationController.getCategories);
router.post('/donations', donationController.createDonation);
router.get('/donations/:donationId/receipt', donationController.getReceipt);

module.exports = router;
