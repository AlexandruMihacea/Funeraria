const serviceService = require('../services/serviceService');

async function create(req, res) {
  try {
    const funeralHomeId = req.user.funeralHomeId;
    const { name, description, price } = req.body;
    const service = await serviceService.createService({ name, description, price, funeralHomeId });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la creare serviciu', error: err.message });
  }
}

async function list(req, res) {
  try {
    const funeralHomeId = req.user.funeralHomeId;
    const services = await serviceService.getServicesByFuneralHome(funeralHomeId);
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la listare servicii', error: err.message });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    await serviceService.updateService(id, { name, description, price });
    res.json({ message: 'Serviciu actualizat' });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la actualizare serviciu', error: err.message });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    await serviceService.deleteService(id);
    res.json({ message: 'Serviciu șters' });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la ștergere serviciu', error: err.message });
  }
}

module.exports = { create, list, update, remove }; 