const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', serviceController.getServices);
router.get('/:id', serviceController.getServiceById);

// Admin-only management endpoints
router.post('/', authenticate, requireRole(['SUPER_ADMIN']), serviceController.createService);
router.put('/:id', authenticate, requireRole(['SUPER_ADMIN']), serviceController.updateService);
router.patch('/:id/status', authenticate, requireRole(['SUPER_ADMIN']), serviceController.toggleStatus);
router.delete('/:id', authenticate, requireRole(['SUPER_ADMIN']), serviceController.deleteService);

module.exports = router;
