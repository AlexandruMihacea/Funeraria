const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateJWT, requireAdminRole, requireFuneralHomeRole, requireUserRole } = require('../middlewares/auth');

router.get('/admin', authenticateJWT, requireAdminRole, dashboardController.adminDashboard);
router.get('/funeral-home', authenticateJWT, requireFuneralHomeRole, dashboardController.funeralHomeDashboard);
router.get('/user', authenticateJWT, requireUserRole, dashboardController.userDashboard);

module.exports = router; 