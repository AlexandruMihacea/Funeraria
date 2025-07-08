const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Service = require('./Service');

const FuneralHome = sequelize.define('FuneralHome', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' },
  },
}, {
  timestamps: true,
});

FuneralHome.hasMany(Service, { foreignKey: 'funeralHomeId', as: 'services' });
Service.belongsTo(FuneralHome, { foreignKey: 'funeralHomeId', as: 'funeralHome' });

module.exports = FuneralHome; 