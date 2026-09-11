/**
 * Pooja Controller
 */

const poojaService = require('../services/poojaService');
const { sendSuccess } = require('../utils/apiResponse');

async function getPoojas(req, res, next) {
  try {
    const result = await poojaService.getPoojas(req.query);
    return sendSuccess(res, 'Poojas retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

async function getPoojaBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const result = await poojaService.getPoojaBySlug(slug);
    return sendSuccess(res, 'Pooja details retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

async function getCategories(req, res, next) {
  try {
    const result = await poojaService.getPoojaCategories();
    return sendSuccess(res, 'Pooja categories retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

async function getSlots(req, res, next) {
  try {
    const { poojaId } = req.params;
    const { date } = req.query;
    const result = await poojaService.getPoojaSlots(poojaId, date);
    return sendSuccess(res, 'Available slots retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPoojas,
  getPoojaBySlug,
  getCategories,
  getSlots
};
