const express = require('express');
const router = express.Router();
const funeralHomeController = require('../controllers/funeralHomeController');

// GET /api/funeral-homes?city=...  (listare case funerare, opțional filtrare după oraș)
router.get('/', funeralHomeController.listFuneralHomes);

// GET /api/funeral-homes/:id  (detalii casă funerară cu servicii)
router.get('/:id', funeralHomeController.getFuneralHome);

router.post('/create', funeralHomeController.createFuneralHome);

module.exports = router; 