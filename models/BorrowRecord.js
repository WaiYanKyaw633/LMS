
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BorrowRecord = sequelize.define('BorrowRecord', {
  borrowedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  returnedAt: { type: DataTypes.DATE, allowNull: true },
  UserId: {   
    type: DataTypes.INTEGER,
    allowNull: false, 
  },
  BookId: {   
    type: DataTypes.INTEGER,
    allowNull: false, 
  }
});

module.exports = BorrowRecord;
