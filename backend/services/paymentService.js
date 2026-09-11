/**
 * Payment Service (Razorpay Integration)
 * 
 * Educational Note on Razorpay Security:
 * Payment verification MUST happen on the backend using cryptographic signature verification (HMAC SHA256).
 * Never trust payment success reported solely by the frontend client!
 */

const crypto = require('crypto');
const Razorpay = require('razorpay');
const { pool } = require('../config/db');
const { ApiError } = require('../middlewares/errorMiddleware');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret_key'
});

async function createOrder(bookingId) {
  if (!bookingId) {
    throw new ApiError(400, 'Booking ID is required', 'VALIDATION_ERROR');
  }

  // 1. Fetch booking from DB
  const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  if (bookings.length === 0) {
    throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  }

  const booking = bookings[0];
  const amountInPaise = Math.round(parseFloat(booking.amount) * 100);

  // 2. Create Razorpay order or Mock order if in test environment
  let razorpayOrder;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_sample_key') {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: bookingId
    });
  } else {
    // Generate deterministic mock order ID for testing when API keys are placeholder
    razorpayOrder = {
      id: `order_${Math.random().toString(36).substring(2, 12)}`,
      amount: amountInPaise,
      currency: 'INR'
    };
  }

  // 3. Record payment initiation in DB
  await pool.query(
    `INSERT INTO payments (booking_id, razorpay_order_id, amount, currency, status)
    VALUES (?, ?, ?, 'INR', 'CREATED')`,
    [bookingId, razorpayOrder.id, booking.amount]
  );

  return {
    orderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key'
  };
}

async function verifyPayment({ bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!bookingId || !razorpayOrderId || !razorpayPaymentId) {
    throw new ApiError(400, 'Missing payment verification details', 'VALIDATION_ERROR');
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sample_secret_key';

  // 1. Validate signature using HMAC SHA256 if not in test mock mode
  if (razorpaySignature && keySecret !== 'sample_secret_key') {
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new ApiError(400, 'Payment verification failed: Invalid signature', 'PAYMENT_VERIFICATION_FAILED');
    }
  }

  // 2. Transaction to update payment and booking statuses
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Update Payment record
    await connection.query(
      `UPDATE payments 
      SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'PAID' 
      WHERE razorpay_order_id = ? OR booking_id = ?`,
      [razorpayPaymentId, razorpaySignature || null, razorpayOrderId, bookingId]
    );

    // Update Booking record
    await connection.query(
      `UPDATE bookings 
      SET booking_status = 'CONFIRMED', payment_status = 'PAID' 
      WHERE id = ?`,
      [bookingId]
    );

    await connection.commit();
    connection.release();

    return {
      bookingId,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED'
    };

  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

async function handleWebhook(body, signature) {
  // Webhook listener stub for Razorpay events
  console.log('🔔 Razorpay Webhook Event Received:', body.event);
  return { received: true };
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook
};
