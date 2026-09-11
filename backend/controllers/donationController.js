/**
 * Donation Controller
 */

const donationService = require('../services/donationService');
const { sendSuccess } = require('../utils/apiResponse');

async function getCategories(req, res, next) {
  try {
    const result = await donationService.getCategories();
    return sendSuccess(res, 'Donation categories retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

async function createDonation(req, res, next) {
  try {
    const result = await donationService.createDonation(req.body);
    return sendSuccess(res, 'Donation order initiated', result, 201);
  } catch (error) {
    next(error);
  }
}

async function getReceipt(req, res, next) {
  try {
    const { donationId } = req.params;
    const result = await donationService.getReceipt(donationId);
    return sendSuccess(res, 'Receipt details retrieved', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  createDonation,
  getReceipt
};
