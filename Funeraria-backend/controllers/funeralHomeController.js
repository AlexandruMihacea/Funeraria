const funeralHomeService = require('../services/funeralHomeService');
const FuneralHome = require('../models/FuneralHome');

async function listFuneralHomes(req, res) {
  try {
    const { city } = req.query;
    const homes = await funeralHomeService.getAllFuneralHomes(city);
    res.json(homes);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la listare case funerare.', error: err.message });
  }
}

async function getFuneralHome(req, res) {
  try {
    const { id } = req.params;
    const home = await funeralHomeService.getFuneralHomeById(id);
    if (!home) return res.status(404).json({ message: 'Casa funerară nu a fost găsită.' });
    res.json(home);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la detalii casă funerară.', error: err.message });
  }
}

async function createFuneralHome(req, res) {
  try {
    const { name, address, city, phone, email, userId } = req.body;
    if (!name || !address || !city || !phone || !email || !userId) {
      return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii.' });
    }
    const existing = await FuneralHome.findOne({ where: { userId } });
    if (existing) {
      return res.status(409).json({ message: 'Există deja o casă funerară pentru acest user.' });
    }
    const home = await FuneralHome.create({ name, address, city, phone, email, userId });
    res.status(201).json(home);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la creare casă funerară.', error: err.message });
  }
}

module.exports = { listFuneralHomes, getFuneralHome, createFuneralHome }; 