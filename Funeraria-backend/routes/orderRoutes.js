const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateJWT, requireFuneralHomeRole } = require('../middlewares/auth');

// Utilizator (client)
router.post('/', authenticateJWT, orderController.create);
router.get('/my', authenticateJWT, orderController.getByUser);
router.get('/:id', authenticateJWT, orderController.getById);
router.delete('/:id', authenticateJWT, orderController.remove);
router.get('/:id/status-log', authenticateJWT, orderController.getStatusLog);
router.post('/:id/pay', authenticateJWT, orderController.pay);

// Casă funerară (admin)
router.get('/funeral-home/orders', authenticateJWT, requireFuneralHomeRole, orderController.getByFuneralHome);
router.put('/:id/status', authenticateJWT, requireFuneralHomeRole, orderController.updateStatus);

router.get('/export', authenticateJWT, orderController.exportCSV);

module.exports = router; 