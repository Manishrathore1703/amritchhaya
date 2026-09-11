/**
 * Content Routes
 */

const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/gallery', contentController.getGallery);
router.get('/blogs', contentController.getBlogs);
router.get('/blogs/:slug', contentController.getBlogBySlug);
router.get('/events', contentController.getEvents);
router.get('/events/:slug', contentController.getEventBySlug);
router.get('/testimonials', contentController.getTestimonials);
router.post('/enquiries', contentController.createEnquiry);

module.exports = router;
