/**
 * Yatra Service
 */

const { pool } = require('../config/db');
const { ApiError } = require('../middlewares/errorMiddleware');

async function getYatras() {
  const [yatras] = await pool.query(
    'SELECT id, name, slug, duration, starting_price as startingPrice, image FROM yatras ORDER BY id DESC'
  );
  return yatras.map(y => ({ ...y, startingPrice: parseFloat(y.startingPrice) }));
}

async function getYatraBySlug(slug) {
  const [yatras] = await pool.query('SELECT * FROM yatras WHERE slug = ?', [slug]);
  if (yatras.length === 0) {
    throw new ApiError(404, 'Yatra package not found', 'RESOURCE_NOT_FOUND');
  }

  const yatra = yatras[0];
  const [itinerary] = await pool.query(
    'SELECT day, title, description FROM yatra_itineraries WHERE yatra_id = ? ORDER BY day ASC',
    [yatra.id]
  );

  return {
    id: yatra.id,
    name: yatra.name,
    slug: yatra.slug,
    description: yatra.description,
    duration: yatra.duration,
    startingPrice: parseFloat(yatra.starting_price),
    image: yatra.image,
    itinerary
  };
}

async function createYatraBooking({ yatraId, dateId, numberOfPeople, customer }) {
  if (!yatraId || !customer || !customer.name || !customer.phone) {
    throw new ApiError(400, 'Missing yatra booking details', 'VALIDATION_ERROR');
  }

  const [yatras] = await pool.query('SELECT starting_price FROM yatras WHERE id = ?', [yatraId]);
  if (yatras.length === 0) {
    throw new ApiError(404, 'Yatra package not found', 'RESOURCE_NOT_FOUND');
  }

  const numPeople = parseInt(numberOfPeople) || 1;
  const totalPrice = parseFloat(yatras[0].starting_price) * numPeople;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Get/Save customer
    let customerId;
    const [existing] = await connection.query('SELECT id FROM customers WHERE phone = ?', [customer.phone]);
    if (existing.length > 0) {
      customerId = existing[0].id;
    } else {
      const [cRes] = await connection.query(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [customer.name, customer.phone, customer.email || null]
      );
      customerId = cRes.insertId;
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `YAT-${new Date().getFullYear()}-${randomNum}`;

    await connection.query(
      `INSERT INTO yatra_bookings (id, yatra_id, date_id, number_of_people, customer_id, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [bookingId, yatraId, dateId || null, numPeople, customerId, totalPrice]
    );

    await connection.commit();
    connection.release();

    return {
      bookingId,
      yatraId,
      numberOfPeople: numPeople,
      totalAmount: totalPrice,
      status: 'PENDING'
    };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

module.exports = {
  getYatras,
  getYatraBySlug,
  createYatraBooking
};
