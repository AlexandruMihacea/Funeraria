const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const OrderItem = require('./OrderItem');
const OrderStatusLog = require('./OrderStatusLog');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
  funeralHomeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'FuneralHomes', key: 'id' },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'completed', 'canceled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderStatusLog, { foreignKey: 'orderId', as: 'statusLogs' });
OrderStatusLog.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = Order; 