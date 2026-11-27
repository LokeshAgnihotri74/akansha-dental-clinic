const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateLogin } = require('../middleware/validator');
const { loginRateLimiter } = require('../middleware/authRateLimiter');

router.post('/login', loginRateLimiter, validateLogin, authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, authController.changePassword);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', authController.logout);

module.exports = router;
