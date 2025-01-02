const User = require('./User');
const Book = require('./Book');
const BorrowRecord = require('./BorrowRecord');


User.hasMany(BorrowRecord);
BorrowRecord.belongsTo(User);
Book.hasMany(BorrowRecord);
BorrowRecord.belongsTo(Book);

module.exports = { User, Book, BorrowRecord };
