const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.patch('/me', authenticateJWT, userController.updateProfile);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.patch('/change-password', authenticateJWT, userController.changePassword);

module.exports = router; 