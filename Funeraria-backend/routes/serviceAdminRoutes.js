const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateJWT, requireFuneralHomeRole } = require('../middlewares/auth');

router.use(authenticateJWT, requireFuneralHomeRole);

router.post('/', serviceController.create);
router.get('/', serviceController.list);
router.put('/:id', serviceController.update);
router.delete('/:id', serviceController.remove);

module.exports = router; 