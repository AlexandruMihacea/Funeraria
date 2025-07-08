const FuneralHome = require('../models/FuneralHome');
const Service = require('../models/Service');

async function getAllFuneralHomes(city) {
  const where = city ? { city } : {};
  return FuneralHome.findAll({ where });
}

async function getFuneralHomeById(id) {
  return FuneralHome.findByPk(id, {
    include: [{ model: Service, as: 'services' }],
  });
}

module.exports = {
  getAllFuneralHomes,
  getFuneralHomeById,
}; 