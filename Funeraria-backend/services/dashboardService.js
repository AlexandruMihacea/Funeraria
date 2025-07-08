const { Op, fn, col, literal } = require('sequelize');
const User = require('../models/User');
const FuneralHome = require('../models/FuneralHome');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

async function getAdminDashboard() {
  // Total users
  const totalUsers = await User.count({ where: { role: 'user' } });
  // Total funeral homes
  const totalFuneralHomes = await FuneralHome.count();
  // Total orders
  const totalOrders = await Order.count();
  // Total revenue (paid orders)
  const totalRevenue = await Order.sum('total', { where: { status: 'paid' } });
  // Orders by status
  const ordersByStatusRaw = await Order.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });
  const ordersByStatus = {};
  ordersByStatusRaw.forEach(row => { ordersByStatus[row.status] = Number(row.count); });
  // Top cities by orders/total
  const topCities = await Order.findAll({
    attributes: [
      [literal('(SELECT city FROM FuneralHomes WHERE FuneralHomes.id = Order.funeralHomeId)'), 'city'],
      [fn('COUNT', col('Order.id')), 'orders'],
      [fn('SUM', col('Order.total')), 'revenue']
    ],
    group: ['funeralHomeId'],
    order: [[fn('SUM', col('Order.total')), 'DESC']],
    raw: true,
    limit: 5,
  });
  // Top users by order value
  const topUsers = await Order.findAll({
    attributes: [
      'userId',
      [fn('SUM', col('total')), 'totalSpent'],
      [fn('COUNT', col('id')), 'orders']
    ],
    group: ['userId'],
    order: [[fn('SUM', col('total')), 'DESC']],
    raw: true,
    limit: 5,
  });
  // Top funeral homes by revenue/orders
  const topFuneralHomes = await Order.findAll({
    attributes: [
      'funeralHomeId',
      [fn('SUM', col('total')), 'revenue'],
      [fn('COUNT', col('id')), 'orders']
    ],
    group: ['funeralHomeId'],
    order: [[fn('SUM', col('total')), 'DESC']],
    raw: true,
    limit: 5,
  });
  return {
    totalUsers,
    totalFuneralHomes,
    totalOrders,
    totalRevenue: Number(totalRevenue || 0),
    ordersByStatus,
    topCities,
    topUsers,
    topFuneralHomes,
  };
}

async function getFuneralHomeDashboard(funeralHomeId) {
  // Total orders for this funeral home
  const totalOrders = await Order.count({ where: { funeralHomeId } });
  // Total revenue (paid orders)
  const totalRevenue = await Order.sum('total', { where: { funeralHomeId, status: 'paid' } });
  // Orders by status
  const ordersByStatusRaw = await Order.findAll({
    where: { funeralHomeId },
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });
  const ordersByStatus = {};
  ordersByStatusRaw.forEach(row => { ordersByStatus[row.status] = Number(row.count); });
  // Top services sold (by quantity)
  const topServices = await OrderItem.findAll({
    include: [{ model: Order, as: 'order', where: { funeralHomeId } }],
    attributes: ['serviceId', 'name', [fn('SUM', col('quantity')), 'totalSold']],
    group: ['serviceId', 'name'],
    order: [[fn('SUM', col('quantity')), 'DESC']],
    raw: true,
    limit: 5,
  });
  return {
    totalOrders,
    totalRevenue: Number(totalRevenue || 0),
    ordersByStatus,
    topServices,
  };
}

async function getUserDashboard(userId) {
  // Istoric comenzi
  const orders = await Order.findAll({
    where: { userId },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['createdAt', 'DESC']],
    raw: false,
  });
  // Comenzi active (pending sau paid)
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid');
  // Suma totală cheltuită (doar comenzile plătite)
  const totalSpent = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + Number(o.total), 0);
  return {
    orders,
    activeOrders,
    totalSpent,
  };
}

module.exports = { getAdminDashboard, getFuneralHomeDashboard, getUserDashboard }; 