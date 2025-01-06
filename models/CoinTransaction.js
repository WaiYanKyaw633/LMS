const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const CoinTransaction = sequelize.define('CoinTransaction', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  transactionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = CoinTransaction;
