const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  funeralHomeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'FuneralHomes', key: 'id' },
  },
}, {
  timestamps: true,
});

module.exports = Service; 