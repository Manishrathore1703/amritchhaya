/**
 * Admin Controller
 * Protected admin API handlers
 */

const { pool } = require('../config/db');
const { sendSuccess } = require('../utils/apiResponse');
const { ApiError } = require('../middlewares/errorMiddleware');

// 1. Dashboard Statistics & Aggregation
async function getDashboard(req, res, next) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Bookings count
    const [bookingStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN booking_status = 'PENDING_PAYMENT' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN booking_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
      FROM bookings
    `, [todayStr]);

    // Donations count & sum
    const [donationStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) as today,
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END), 0) as amount
      FROM donations
    `, [todayStr]);

    // Revenue
    const [revenueStats] = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN DATE(created_at) = ? AND payment_status = 'PAID' THEN amount ELSE 0 END), 0) as today,
        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND payment_status = 'PAID' THEN amount ELSE 0 END), 0) as thisMonth,
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END), 0) as total
      FROM bookings
    `, [todayStr]);

    // Customers
    const [customerStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) THEN 1 ELSE 0 END) as newThisMonth
      FROM customers
    `);

    return sendSuccess(res, 'Admin dashboard metrics retrieved', {
      bookings: {
        total: bookingStats[0].total || 0,
        today: bookingStats[0].today || 0,
        pending: bookingStats[0].pending || 0,
        completed: bookingStats[0].completed || 0
      },
      donations: {
        total: donationStats[0].total || 0,
        today: donationStats[0].today || 0,
        amount: parseFloat(donationStats[0].amount || 0)
      },
      revenue: {
        today: parseFloat(revenueStats[0].today || 0),
        thisMonth: parseFloat(revenueStats[0].thisMonth || 0),
        total: parseFloat(revenueStats[0].total || 0)
      },
      customers: {
        total: customerStats[0].total || 0,
        newThisMonth: customerStats[0].newThisMonth || 0
      }
    });
  } catch (error) {
    next(error);
  }
}

// 2. Admin Pooja Management
async function createPooja(req, res, next) {
  try {
    const { name, description, categoryId, duration, featured, status } = req.body;
    if (!name) {
      throw new ApiError(400, 'Pooja name is required', 'VALIDATION_ERROR');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const [result] = await pool.query(
      'INSERT INTO poojas (name, slug, description, category_id, duration, featured, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description || '', categoryId || null, duration || '2 Hours', featured ? 1 : 0, status || 'ACTIVE']
    );

    return sendSuccess(res, 'Pooja created successfully', { id: result.insertId, name, slug }, 201);
  } catch (error) {
    next(error);
  }
}

async function updatePooja(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, categoryId, duration, featured, status } = req.body;

    await pool.query(
      'UPDATE poojas SET name = COALESCE(?, name), description = COALESCE(?, description), category_id = COALESCE(?, category_id), duration = COALESCE(?, duration), featured = COALESCE(?, featured), status = COALESCE(?, status) WHERE id = ?',
      [name, description, categoryId, duration, featured !== undefined ? (featured ? 1 : 0) : null, status, id]
    );

    return sendSuccess(res, 'Pooja updated successfully', { id });
  } catch (error) {
    next(error);
  }
}

async function deletePooja(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM poojas WHERE id = ?', [id]);
    return sendSuccess(res, 'Pooja deleted successfully', null);
  } catch (error) {
    next(error);
  }
}

// 3. Admin Bookings
async function getBookings(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let whereClauses = ['1=1'];
    let params = [];

    if (req.query.status) {
      whereClauses.push('b.booking_status = ?');
      params.push(req.query.status);
    }
    if (req.query.paymentStatus) {
      whereClauses.push('b.payment_status = ?');
      params.push(req.query.paymentStatus);
    }

    const whereSql = whereClauses.join(' AND ');
    const [count] = await pool.query(`SELECT COUNT(*) as total FROM bookings b WHERE ${whereSql}`, params);
    const [items] = await pool.query(`
      SELECT 
        b.id, b.booking_status as bookingStatus, b.payment_status as paymentStatus,
        b.booking_date as date, b.amount, b.created_at as createdAt,
        p.name as poojaName, c.name as customerName, c.phone as customerPhone
      FROM bookings b
      JOIN poojas p ON b.pooja_id = p.id
      JOIN customers c ON b.customer_id = c.id
      WHERE ${whereSql}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return sendSuccess(res, 'Bookings retrieved', {
      items,
      pagination: {
        page,
        limit,
        total: count[0].total,
        totalPages: Math.ceil(count[0].total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['PENDING_PAYMENT', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    if (!allowed.includes(status)) {
      throw new ApiError(400, 'Invalid status', 'VALIDATION_ERROR');
    }

    await pool.query('UPDATE bookings SET booking_status = ? WHERE id = ?', [status, id]);
    return sendSuccess(res, 'Booking status updated successfully', { id, status });
  } catch (error) {
    next(error);
  }
}

// 4. Admin Customers
async function getCustomers(req, res, next) {
  try {
    const [items] = await pool.query('SELECT id, name, phone, email, gotra, created_at as createdAt FROM customers ORDER BY id DESC');
    return sendSuccess(res, 'Customers retrieved', items);
  } catch (error) {
    next(error);
  }
}

async function getCustomerDetails(req, res, next) {
  try {
    const { id } = req.params;
    const [customers] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (customers.length === 0) {
      throw new ApiError(404, 'Customer not found', 'RESOURCE_NOT_FOUND');
    }

    const [bookings] = await pool.query('SELECT * FROM bookings WHERE customer_id = ?', [id]);
    const [donations] = await pool.query('SELECT * FROM donations WHERE donor_id = ?', [id]);
    const [yatras] = await pool.query('SELECT * FROM yatra_bookings WHERE customer_id = ?', [id]);

    return sendSuccess(res, 'Customer profile retrieved', {
      profile: customers[0],
      bookingHistory: bookings,
      donationHistory: donations,
      yatraHistory: yatras
    });
  } catch (error) {
    next(error);
  }
}

// 5. Admin Donations
async function getDonations(req, res, next) {
  try {
    const [items] = await pool.query(`
      SELECT d.id, d.amount, d.payment_status as paymentStatus, d.created_at as createdAt,
             dc.name as categoryName, c.name as donorName
      FROM donations d
      JOIN donation_categories dc ON d.category_id = dc.id
      JOIN customers c ON d.donor_id = c.id
      ORDER BY d.created_at DESC
    `);
    return sendSuccess(res, 'Donations list retrieved', items);
  } catch (error) {
    next(error);
  }
}

// 6. Admin Enquiries
async function getEnquiries(req, res, next) {
  try {
    const [items] = await pool.query('SELECT * FROM enquiries ORDER BY id DESC');
    return sendSuccess(res, 'Enquiries list retrieved', items);
  } catch (error) {
    next(error);
  }
}

async function updateEnquiryStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    await pool.query('UPDATE enquiries SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?', [status, notes, id]);
    return sendSuccess(res, 'Enquiry updated successfully', { id, status });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  createPooja,
  updatePooja,
  deletePooja,
  getBookings,
  updateBookingStatus,
  getCustomers,
  getCustomerDetails,
  getDonations,
  getEnquiries,
  updateEnquiryStatus
};
