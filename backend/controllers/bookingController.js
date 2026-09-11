/**
 * Booking Controller
 */

const bookingService = require('../services/bookingService');
const { sendSuccess } = require('../utils/apiResponse');

async function createBooking(req, res, next) {
  try {
    const result = await bookingService.createBooking(req.body);
    return sendSuccess(res, 'Booking created successfully', result, 201);
  } catch (error) {
    next(error);
  }
}

async function getBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const result = await bookingService.getBookingById(bookingId);
    return sendSuccess(res, 'Booking retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getBooking
};
