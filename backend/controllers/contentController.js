/**
 * Content Controller (Gallery, Blogs, Events, Testimonials, Enquiries)
 */

const { pool } = require('../config/db');
const { sendSuccess } = require('../utils/apiResponse');
const { ApiError } = require('../middlewares/errorMiddleware');

// 1. Gallery
async function getGallery(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];
    if (req.query.category) {
      whereClause = 'WHERE category = ?';
      params.push(req.query.category);
    }

    const [count] = await pool.query(`SELECT COUNT(*) as total FROM gallery ${whereClause}`, params);
    const [items] = await pool.query(`SELECT id, title, image, category, description FROM gallery ${whereClause} LIMIT ? OFFSET ?`, [...params, limit, offset]);

    return sendSuccess(res, 'Gallery items retrieved', {
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

// 2. Blogs
async function getBlogs(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [count] = await pool.query("SELECT COUNT(*) as total FROM blogs WHERE status = 'PUBLISHED'");
    const [items] = await pool.query("SELECT id, title, slug, image, category, created_at as createdAt FROM blogs WHERE status = 'PUBLISHED' ORDER BY id DESC LIMIT ? OFFSET ?", [limit, offset]);

    return sendSuccess(res, 'Blogs retrieved', {
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

async function getBlogBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [blogs] = await pool.query("SELECT id, title, slug, content, image, category, seo_title as seoTitle, seo_description as seoDescription, created_at as createdAt FROM blogs WHERE slug = ? AND status = 'PUBLISHED'", [slug]);
    if (blogs.length === 0) {
      throw new ApiError(404, 'Blog post not found', 'RESOURCE_NOT_FOUND');
    }
    return sendSuccess(res, 'Blog post retrieved', blogs[0]);
  } catch (error) {
    next(error);
  }
}

// 3. Events
async function getEvents(req, res, next) {
  try {
    const [items] = await pool.query('SELECT id, title, slug, description, date, location, image FROM events ORDER BY id DESC');
    return sendSuccess(res, 'Events retrieved', items);
  } catch (error) {
    next(error);
  }
}

async function getEventBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [events] = await pool.query('SELECT id, title, slug, description, date, location, image FROM events WHERE slug = ?', [slug]);
    if (events.length === 0) {
      throw new ApiError(404, 'Event not found', 'RESOURCE_NOT_FOUND');
    }
    return sendSuccess(res, 'Event details retrieved', events[0]);
  } catch (error) {
    next(error);
  }
}

// 4. Testimonials
async function getTestimonials(req, res, next) {
  try {
    const [items] = await pool.query('SELECT id, name, role, message, rating, image FROM testimonials ORDER BY id DESC');
    return sendSuccess(res, 'Testimonials retrieved', items);
  } catch (error) {
    next(error);
  }
}

// 5. Enquiries
async function createEnquiry(req, res, next) {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !phone || !message) {
      throw new ApiError(400, 'Name, phone, and message are required', 'VALIDATION_ERROR');
    }

    await pool.query(
      'INSERT INTO enquiries (name, phone, email, message, status) VALUES (?, ?, ?, ?, "NEW")',
      [name, phone, email || null, message]
    );

    return sendSuccess(res, 'Your enquiry has been submitted successfully', null, 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGallery,
  getBlogs,
  getBlogBySlug,
  getEvents,
  getEventBySlug,
  getTestimonials,
  createEnquiry
};
