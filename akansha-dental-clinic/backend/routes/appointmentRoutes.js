const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { validateAppointmentBooking, validateStatusUpdate } = require('../middleware/validator');

// Public endpoints
router.get('/available-slots', appointmentController.getSlots);
router.post('/', validateAppointmentBooking, appointmentController.bookAppointment);

// Authenticated staff/admin endpoints
router.get('/', authenticate, appointmentController.searchAppointments);
router.get('/:id', authenticate, appointmentController.getAppointmentById);
router.patch('/:id/status', authenticate, validateStatusUpdate, appointmentController.updateStatus);
router.delete('/:id', authenticate, requireRole(['SUPER_ADMIN']), appointmentController.deleteAppointment);

module.exports = router;
