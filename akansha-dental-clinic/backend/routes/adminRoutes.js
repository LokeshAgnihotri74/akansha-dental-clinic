const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticate, authorizeRoles('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), adminController.getAdmins);
router.post('/', authenticate, authorizeRoles('ROLE_SUPER_ADMIN'), adminController.createAdmin);

module.exports = router;
