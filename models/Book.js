const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    validate: {
      notEmpty: true, 
    },
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true, 
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true, 
    },
  },
  stock: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,  
  },
  isBorrowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  priceInCoins: {
    type: DataTypes.INTEGER,
    defaultValue: 0, 
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, 
  },
}, {
  timestamps: true, 
});

module.exports = Book;
