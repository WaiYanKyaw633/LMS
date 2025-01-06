const User = require('./User');
const Book = require('./Book');
const BorrowRecord = require('./BorrowRecord');
const CoinTransaction=require('./CoinTransaction');


User.hasMany(BorrowRecord);
BorrowRecord.belongsTo(User);
Book.hasMany(BorrowRecord);
BorrowRecord.belongsTo(Book);
User.hasMany(CoinTransaction, { foreignKey: 'userId' });
CoinTransaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Book, BorrowRecord };
