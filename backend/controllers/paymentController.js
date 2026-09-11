/**
 * Payment Controller
 */

const paymentService = require('../services/paymentService');
const { sendSuccess } = require('../utils/apiResponse');

async function createOrder(req, res, next) {
  try {
    const { bookingId } = req.body;
    const result = await paymentService.createOrder(bookingId);
    return sendSuccess(res, 'Razorpay order created successfully', result);
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const result = await paymentService.verifyPayment(req.body);
    return sendSuccess(res, 'Payment verified successfully', result);
  } catch (error) {
    next(error);
  }
}

async function webhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);
    return sendSuccess(res, 'Webhook processed successfully', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  webhook
};
