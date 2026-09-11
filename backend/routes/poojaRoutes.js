/**
 * Pooja Routes
 */

const express = require('express');
const router = express.Router();
const poojaController = require('../controllers/poojaController');

router.get('/poojas', poojaController.getPoojas);
router.get('/pooja-categories', poojaController.getCategories);
router.get('/poojas/:slug', poojaController.getPoojaBySlug);
router.get('/poojas/:poojaId/slots', poojaController.getSlots);

module.exports = router;
