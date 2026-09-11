/**
 * Yatra Controller
 */

const yatraService = require('../services/yatraService');
const { sendSuccess } = require('../utils/apiResponse');

async function getYatras(req, res, next) {
  try {
    const result = await yatraService.getYatras();
    return sendSuccess(res, 'Yatra packages retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

async function getYatraBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const result = await yatraService.getYatraBySlug(slug);
    return sendSuccess(res, 'Yatra package details retrieved', result);
  } catch (error) {
    next(error);
  }
}

async function createYatraBooking(req, res, next) {
  try {
    const result = await yatraService.createYatraBooking(req.body);
    return sendSuccess(res, 'Yatra booking created successfully', result, 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getYatras,
  getYatraBySlug,
  createYatraBooking
};
