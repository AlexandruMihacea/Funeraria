const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Service = require('../models/Service');
const OrderStatusLog = require('../models/OrderStatusLog');

async function createOrder({ userId, funeralHomeId, address, contactName, contactPhone, contactEmail, items }) {
  // items: [{ serviceId, quantity }]
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const service = await Service.findByPk(item.serviceId);
    if (!service) throw new Error(`Serviciul cu id ${item.serviceId} nu există.`);
    total += Number(service.price) * (item.quantity || 1);
    orderItems.push({
      serviceId: service.id,
      name: service.name,
      price: service.price,
      quantity: item.quantity || 1,
    });
  }
  const order = await Order.create({
    userId,
    funeralHomeId,
    address,
    contactName,
    contactPhone,
    contactEmail,
    total,
    status: 'pending',
  });
  for (const item of orderItems) {
    await OrderItem.create({ ...item, orderId: order.id });
  }
  return getOrderById(order.id);
}

async function getOrderById(id) {
  return Order.findByPk(id, { include: [{ model: OrderItem, as: 'items' }] });
}

async function getOrdersByUser(userId) {
  return Order.findAll({ where: { userId }, include: [{ model: OrderItem, as: 'items' }] });
}

async function getOrdersByFuneralHome(funeralHomeId) {
  return Order.findAll({ where: { funeralHomeId }, include: [{ model: OrderItem, as: 'items' }] });
}

async function updateOrderStatus(id, status, changedBy) {
  await Order.update({ status }, { where: { id } });
  await OrderStatusLog.create({ orderId: id, status, changedBy });
  return getOrderById(id);
}

async function deleteOrder(id) {
  await OrderItem.destroy({ where: { orderId: id } });
  return Order.destroy({ where: { id } });
}

async function payOrder(orderId, userId) {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error('Comanda nu a fost găsită.');
  if (order.userId !== userId) throw new Error('Nu aveți dreptul să plătiți această comandă.');
  if (order.status !== 'pending') throw new Error('Comanda nu mai poate fi plătită.');
  await Order.update({ status: 'paid' }, { where: { id: orderId } });
  await OrderStatusLog.create({ orderId, status: 'paid', changedBy: userId });
  return getOrderById(orderId);
}

async function getAllOrders() {
  return Order.findAll();
}

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getOrdersByFuneralHome,
  updateOrderStatus,
  deleteOrder,
  payOrder,
  getAllOrders,
}; 