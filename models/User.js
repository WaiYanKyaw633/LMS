
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
  },
  coins: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, 
  },
}, {
  timestamps: true,
});

module.exports = User;
