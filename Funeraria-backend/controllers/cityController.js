const cityService = require('../services/cityService');

async function listCities(req, res) {
  try {
    const cities = await cityService.getAllCities();
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la listare orașe.', error: err.message });
  }
}

module.exports = { listCities }; 