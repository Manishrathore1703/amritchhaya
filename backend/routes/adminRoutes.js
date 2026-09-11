/**
 * Admin Routes
 * Protected by JWT Authentication middleware
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Apply auth middleware to ALL admin routes
router.use(authenticateToken);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Pooja Management
router.post('/poojas', adminController.createPooja);
router.put('/poojas/:id', adminController.updatePooja);
router.delete('/poojas/:id', adminController.deletePooja);

// Booking Management
router.get('/bookings', adminController.getBookings);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

// Customer Management
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerDetails);

// Donation Management
router.get('/donations', adminController.getDonations);

// Enquiry Management
router.get('/enquiries', adminController.getEnquiries);
router.patch('/enquiries/:id', adminController.updateEnquiryStatus);

module.exports = router;
