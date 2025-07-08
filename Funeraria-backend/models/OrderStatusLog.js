const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderStatusLog = sequelize.define('OrderStatusLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Orders', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'completed', 'canceled'),
    allowNull: false,
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
}, {
  timestamps: true,
});

module.exports = OrderStatusLog; 