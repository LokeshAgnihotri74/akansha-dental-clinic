const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/schedules', doctorController.getSchedules);

// Admin-only management endpoints
router.post('/', authenticate, requireRole(['SUPER_ADMIN']), doctorController.createDoctor);
router.put('/:id', authenticate, requireRole(['SUPER_ADMIN']), doctorController.updateDoctor);
router.patch('/:id/status', authenticate, requireRole(['SUPER_ADMIN']), doctorController.toggleStatus);
router.delete('/:id', authenticate, requireRole(['SUPER_ADMIN']), doctorController.deleteDoctor);

module.exports = router;
