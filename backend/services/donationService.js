/**
 * Donation Service
 */

const { pool } = require('../config/db');
const { ApiError } = require('../middlewares/errorMiddleware');

async function getCategories() {
  const [categories] = await pool.query('SELECT id, name, slug FROM donation_categories ORDER BY id ASC');
  return categories;
}

async function createDonation({ categoryId, amount, donor, anonymous }) {
  if (!categoryId || !amount || !donor || !donor.name || !donor.phone) {
    throw new ApiError(400, 'Missing required donation details', 'VALIDATION_ERROR');
  }

  const donationAmount = parseFloat(amount);
  if (isNaN(donationAmount) || donationAmount <= 0) {
    throw new ApiError(400, 'Invalid donation amount', 'VALIDATION_ERROR');
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Get/Save Donor
    let donorId;
    const [existing] = await connection.query('SELECT id FROM customers WHERE phone = ?', [donor.phone]);
    if (existing.length > 0) {
      donorId = existing[0].id;
    } else {
      const [cRes] = await connection.query(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [donor.name, donor.phone, donor.email || null]
      );
      donorId = cRes.insertId;
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const donationId = `DON-${new Date().getFullYear()}-${randomNum}`;
    const receiptUrl = `https://api.amritchhayafoundation.org/uploads/receipts/${donationId}.pdf`;

    await connection.query(
      `INSERT INTO donations (id, category_id, amount, donor_id, anonymous, payment_status, receipt_url)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
      [donationId, categoryId, donationAmount, donorId, anonymous ? 1 : 0, receiptUrl]
    );

    // Mock Razorpay Order ID for Donation
    const mockOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;

    await connection.commit();
    connection.release();

    return {
      donationId,
      amount: donationAmount,
      paymentStatus: 'PENDING',
      paymentOrderId: mockOrderId
    };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

async function getReceipt(donationId) {
  const [donations] = await pool.query('SELECT id, receipt_url FROM donations WHERE id = ?', [donationId]);
  if (donations.length === 0) {
    throw new ApiError(404, 'Donation record not found', 'RESOURCE_NOT_FOUND');
  }

  return {
    donationId,
    receiptUrl: donations[0].receipt_url || `https://api.amritchhayafoundation.org/uploads/receipts/${donationId}.pdf`
  };
}

module.exports = {
  getCategories,
  createDonation,
  getReceipt
};
