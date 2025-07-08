const Service = require('../models/Service');

async function createService(data) {
  return Service.create(data);
}

async function getServicesByFuneralHome(funeralHomeId) {
  return Service.findAll({ where: { funeralHomeId } });
}

async function updateService(id, data) {
  return Service.update(data, { where: { id } });
}

async function deleteService(id) {
  return Service.destroy({ where: { id } });
}

module.exports = {
  createService,
  getServicesByFuneralHome,
  updateService,
  deleteService,
}; 