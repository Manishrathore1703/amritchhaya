/**
 * Goshala Controller & Route logic
 */

const { pool } = require('../config/db');
const { sendSuccess } = require('../utils/apiResponse');

async function getCows(req, res, next) {
  try {
    const [cows] = await pool.query('SELECT id, name, breed, age, image, adoption_available as adoptionAvailable FROM cows');
    const formatted = cows.map(c => ({ ...c, adoptionAvailable: Boolean(c.adoptionAvailable) }));
    return sendSuccess(res, 'Goshala cows retrieved successfully', formatted);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCows
};
