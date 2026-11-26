const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateInquiry } = require('../middleware/validator');

// Public contact inquiry
router.post('/', validateInquiry, inquiryController.submitInquiry);
router.post('/contact', inquiryController.submitContactRequest);

// Admin review
router.get('/', authenticate, inquiryController.searchInquiries);
router.get('/:id', authenticate, inquiryController.getInquiryById);
router.patch('/:id/status', authenticate, inquiryController.updateStatus);

module.exports = router;
