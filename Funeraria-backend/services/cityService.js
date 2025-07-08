const FuneralHome = require('../models/FuneralHome');

async function getAllCities() {
  const cities = await FuneralHome.findAll({
    attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('city')), 'city']],
    raw: true,
  });
  return cities.map(c => c.city);
}

module.exports = { getAllCities }; 