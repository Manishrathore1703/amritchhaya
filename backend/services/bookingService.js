/**
 * Booking Service
 * Handles Booking Creation, Price Calculation, Devotee/Address creation, and Booking Retrieval
 */

const { pool } = require('../config/db');
const { ApiError } = require('../middlewares/errorMiddleware');

async function createBooking(data) {
  const { poojaId, variantId, slotId, date, devotee, specialRequest, prasadRequired } = data;

  if (!poojaId || !variantId || !date || !devotee || !devotee.name || !devotee.phone) {
    throw new ApiError(400, 'Missing required booking parameters', 'VALIDATION_ERROR');
  }

  // 1. Verify Pooja Variant & Get Database Price (Section 47 Rule)
  const [variants] = await pool.query(
    'SELECT * FROM pooja_variants WHERE id = ? AND pooja_id = ?',
    [variantId, poojaId]
  );

  if (variants.length === 0) {
    throw new ApiError(404, 'Selected pooja variant not found', 'RESOURCE_NOT_FOUND');
  }

  const variant = variants[0];
  const finalAmount = parseFloat(variant.price);

  // 2. Database Transaction (Atomic execution for customer, booking, and address)
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Save/Get Customer
    let customerId;
    const [existingCustomers] = await connection.query(
      'SELECT id FROM customers WHERE phone = ?',
      [devotee.phone]
    );

    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
      await connection.query(
        'UPDATE customers SET name = ?, email = ?, gotra = ? WHERE id = ?',
        [devotee.name, devotee.email || null, devotee.gotra || null, customerId]
      );
    } else {
      const [custResult] = await connection.query(
        'INSERT INTO customers (name, phone, email, gotra) VALUES (?, ?, ?, ?)',
        [devotee.name, devotee.phone, devotee.email || null, devotee.gotra || null]
      );
      customerId = custResult.insertId;
    }

    // Generate unique bookingId: ACF-2026-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `ACF-${new Date().getFullYear()}-${randomNum}`;

    // Insert Booking
    await connection.query(
      `INSERT INTO bookings 
      (id, pooja_id, variant_id, slot_id, booking_date, customer_id, special_request, prasad_required, amount, currency, booking_status, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'PENDING_PAYMENT', 'PENDING')`,
      [
        bookingId,
        poojaId,
        variantId,
        slotId || null,
        date,
        customerId,
        specialRequest || null,
        prasadRequired ? 1 : 0,
        finalAmount
      ]
    );

    // Save Address if provided
    if (devotee.address && devotee.address.line1) {
      await connection.query(
        `INSERT INTO booking_addresses (booking_id, line1, city, state, pincode, country)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          devotee.address.line1,
          devotee.address.city || '',
          devotee.address.state || '',
          devotee.address.pincode || '',
          devotee.address.country || 'India'
        ]
      );
    }

    await connection.commit();
    connection.release();

    return {
      bookingId,
      bookingStatus: 'PENDING_PAYMENT',
      amount: finalAmount,
      currency: 'INR',
      paymentRequired: true
    };

  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

async function getBookingById(bookingId) {
  const [rows] = await pool.query(
    `SELECT 
      b.id as bookingId, b.booking_status as bookingStatus, b.payment_status as paymentStatus,
      b.booking_date as date, b.amount, b.currency,
      p.name as poojaName,
      s.start_time, s.end_time,
      c.name as devoteeName
    FROM bookings b
    JOIN poojas p ON b.pooja_id = p.id
    JOIN customers c ON b.customer_id = c.id
    LEFT JOIN pooja_slots s ON b.slot_id = s.id
    WHERE b.id = ?`,
    [bookingId]
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  }

  const row = rows[0];

  return {
    bookingId: row.bookingId,
    bookingStatus: row.bookingStatus,
    paymentStatus: row.paymentStatus,
    pooja: {
      name: row.poojaName
    },
    date: row.date,
    time: row.start_time && row.end_time ? `${row.start_time} - ${row.end_time}` : 'TBD',
    devotee: {
      name: row.devoteeName
    }
  };
}

module.exports = {
  createBooking,
  getBookingById
};
