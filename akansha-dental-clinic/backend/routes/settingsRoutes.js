const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', settingsController.getSettings);
router.get('/all', settingsController.getSettings);
router.put('/:key', authenticate, authorizeRoles('ROLE_SUPER_ADMIN', 'ROLE_ADMIN'), settingsController.updateSetting);

module.exports = router;
