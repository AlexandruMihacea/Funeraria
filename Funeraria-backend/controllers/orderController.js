const orderService = require('../services/orderService');
const OrderStatusLog = require('../models/OrderStatusLog');
const { Parser } = require('json2csv');

async function create(req, res) {
  try {
    const { funeralHomeId, address, contactName, contactPhone, contactEmail, items } = req.body;
    const userId = req.user.id;
    if (!funeralHomeId || !address || !contactName || !contactPhone || !contactEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Toate câmpurile și cel puțin un serviciu sunt obligatorii.' });
    }
    const order = await orderService.createOrder({ userId, funeralHomeId, address, contactName, contactPhone, contactEmail, items });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la creare comandă.', error: err.message });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Comanda nu a fost găsită.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la detalii comandă.', error: err.message });
  }
}

async function getByUser(req, res) {
  try {
    const userId = req.user.id;
    const orders = await orderService.getOrdersByUser(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la listare comenzi user.', error: err.message });
  }
}

async function getByFuneralHome(req, res) {
  try {
    const funeralHomeId = req.user.funeralHomeId;
    const orders = await orderService.getOrdersByFuneralHome(funeralHomeId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la listare comenzi casă funerară.', error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const changedBy = req.user.id;
    const order = await orderService.updateOrderStatus(id, status, changedBy);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la actualizare status.', error: err.message });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    await orderService.deleteOrder(id);
    res.json({ message: 'Comanda a fost ștearsă.' });
  } catch (err) {
    res.status(500).json({ message: 'Eroare la ștergere comandă.', error: err.message });
  }
}

async function getStatusLog(req, res) {
  try {
    const { id } = req.params;
    const logs = await OrderStatusLog.findAll({ where: { orderId: id }, order: [['createdAt', 'ASC']] });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la listare istoric status.', error: err.message });
  }
}

async function pay(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const order = await orderService.payOrder(id, userId);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function exportCSV(req, res) {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await orderService.getAllOrders();
    } else if (req.user.role === 'funeral_home') {
      orders = await orderService.getOrdersByFuneralHome(req.user.funeralHomeId);
    } else {
      return res.status(403).json({ message: 'Export permis doar pentru admin sau case funerare.' });
    }
    // Simplificăm datele pentru CSV
    const data = orders.map(o => ({
      id: o.id,
      userId: o.userId,
      funeralHomeId: o.funeralHomeId,
      address: o.address,
      contactName: o.contactName,
      contactPhone: o.contactPhone,
      contactEmail: o.contactEmail,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt
    }));
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Eroare la export CSV.', error: err.message });
  }
}

module.exports = { create, getById, getByUser, getByFuneralHome, updateStatus, remove, getStatusLog, pay, exportCSV }; 