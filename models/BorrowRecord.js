const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BorrowRecord = sequelize.define('BorrowRecord', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  borrowedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  returnedAt: { type: DataTypes.DATE, allowNull: true },
});

module.exports = BorrowRecord;
