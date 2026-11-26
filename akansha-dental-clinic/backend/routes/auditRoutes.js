const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticate, authorizeRoles('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), auditController.getAuditLogs);

module.exports = router;
