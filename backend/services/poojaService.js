/**
 * Pooja Service
 * Handles DB queries for Poojas, Categories, Variants, and Slots
 */

const { pool } = require('../config/db');
const { ApiError } = require('../middlewares/errorMiddleware');

async function getPoojas({ page = 1, limit = 10, category, search, featured }) {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const offset = (page - 1) * limit;

  let whereClauses = ["p.status = 'ACTIVE'"];
  let queryParams = [];

  if (featured !== undefined) {
    whereClauses.push('p.featured = ?');
    queryParams.push(featured === 'true' || featured === true ? 1 : 0);
  }

  if (category) {
    whereClauses.push('c.slug = ?');
    queryParams.push(category);
  }

  if (search) {
    whereClauses.push('(p.name LIKE ? OR p.short_description LIKE ?)');
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Count total matching items
  const countSql = `SELECT COUNT(*) as total FROM poojas p LEFT JOIN pooja_categories c ON p.category_id = c.id ${whereSql}`;
  const [countResult] = await pool.query(countSql, queryParams);
  const total = countResult[0].total;

  // Fetch paginated items
  const itemsSql = `
    SELECT 
      p.id, p.name, p.slug, p.short_description as shortDescription, 
      p.image, p.starting_price as startingPrice, p.duration, p.featured
    FROM poojas p
    LEFT JOIN pooja_categories c ON p.category_id = c.id
    ${whereSql}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;
  const [items] = await pool.query(itemsSql, [...queryParams, limit, offset]);

  // Format featured field to boolean
  const formattedItems = items.map(item => ({
    ...item,
    startingPrice: parseFloat(item.startingPrice),
    featured: Boolean(item.featured)
  }));

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: formattedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

async function getPoojaBySlug(slug) {
  const [poojas] = await pool.query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM poojas p
    LEFT JOIN pooja_categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.status = 'ACTIVE'
  `, [slug]);

  if (poojas.length === 0) {
    throw new ApiError(404, 'Pooja not found', 'RESOURCE_NOT_FOUND');
  }

  const pooja = poojas[0];

  // Fetch variants
  const [variants] = await pool.query('SELECT id, name, price FROM pooja_variants WHERE pooja_id = ?', [pooja.id]);

  // Fetch features
  const [features] = await pool.query('SELECT feature_text FROM pooja_features WHERE pooja_id = ?', [pooja.id]);

  return {
    id: pooja.id,
    name: pooja.name,
    slug: pooja.slug,
    description: pooja.description,
    image: pooja.image,
    duration: pooja.duration,
    category: pooja.category_id ? {
      id: pooja.category_id,
      name: pooja.category_name
    } : null,
    variants: variants.map(v => ({ id: v.id, name: v.name, price: parseFloat(v.price) })),
    features: features.map(f => f.feature_text)
  };
}

async function getPoojaCategories() {
  const [categories] = await pool.query('SELECT id, name, slug FROM pooja_categories ORDER BY name ASC');
  return categories;
}

async function getPoojaSlots(poojaId, date) {
  const [slots] = await pool.query(`
    SELECT id, start_time as startTime, end_time as endTime, available 
    FROM pooja_slots 
    WHERE pooja_id = ? AND date = ?
  `, [poojaId, date]);

  return {
    date,
    slots: slots.map(s => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      available: Boolean(s.available)
    }))
  };
}

module.exports = {
  getPoojas,
  getPoojaBySlug,
  getPoojaCategories,
  getPoojaSlots
};
