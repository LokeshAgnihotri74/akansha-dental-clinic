const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Get all staff / admins: Super Admin and Admin can view
router.get('/', authenticate, authorizeRoles('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), adminController.getAdmins);

// Super Admin exclusive controls
router.post('/', authenticate, authorizeRoles('ROLE_SUPER_ADMIN'), adminController.createAdmin);
router.put('/:id/status', authenticate, authorizeRoles('ROLE_SUPER_ADMIN'), adminController.updateAdminStatus);
router.put('/:id/reset-password', authenticate, authorizeRoles('ROLE_SUPER_ADMIN'), adminController.resetAdminPassword);
router.delete('/:id', authenticate, authorizeRoles('ROLE_SUPER_ADMIN'), adminController.deleteAdmin);

module.exports = router;
