const { BorrowRecord, Book, User } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sequelize = require('sequelize');
const CoinTransaction = require('../models/CoinTransaction');

exports.viewBooksByCategory = async (req, reply) => {
  const { category } = req.params;
  try {
    const books = await Book.findAll({
      where: { category },
      attributes: ['title', 'author'],
    });
    if (books.length === 0) {
      return reply.status(404).send({ message: 'No books found in this category' });
    }
    const response = {
      Category: category,
      BookCount: books.length,
      Books: books.map((book) => ({
        Title: book.title,
        Author: book.author,
      })),
    };
    reply.send(response);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    reply.status(500).send({ message: 'Failed to fetch books by category' });
  }
};

exports.borrowBook = async (req, reply) => {
  const { bookId } = req.params;

  try {

    const book = await Book.findByPk(bookId);
    if (!book) {
      return reply.status(404).send({ message: 'Book not found' });
    }


    if (book.stock <= 0) {
      return reply.status(400).send({ message: 'Sorry, this book is out of stock' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    if (!book.isFree) {

      if (user.coins < book.priceInCoins) {
        return reply.status(403).send({
          message: `You need ${book.priceInCoins} coins to borrow this book.`,
        });
      }

      user.coins -= book.priceInCoins;
      await user.save();
    }
    await Book.decrement('stock', { by: 1, where: { id: bookId } });
    await Book.update({ isBorrowed: true }, { where: { id: bookId } });
    const borrowRecord = await BorrowRecord.create({
      UserId: req.user.id,
      BookId: bookId,
      borrowedAt: new Date(),
    });

    reply.status(200).send({
      message: 'Book borrowed successfully',
      borrowRecord,
    });
  } catch (error) {
    console.error('Error borrowing book:', error);
    reply.status(500).send({ error: 'Failed to borrow book' });
  }
};

exports.returnBook = async (req, reply) => {
  const { bookId } = req.params;

  try {
    const borrowRecord = await BorrowRecord.findOne({
      where: { userId: req.user.id, bookId, returnedAt: null },
    });

    if (!borrowRecord) {
      return reply.status(404).send({ message: 'you dont borrow this book' });
    }
    await borrowRecord.update({ returnedAt: new Date() });
    await Book.increment('stock', { by: 1, where: { id: bookId } });
    await Book.update({ isBorrowed: false }, { where: { id: bookId } });
    reply.status(200).send({
      message: 'Book returned successfully',
      borrowRecord,
    });
  } catch (error) {
    console.error('Error returning book:', error);
    reply.status(500).send({ error: 'Failed to return book' });
  }
};

exports.viewMyBorrowedBooks = async (req, reply) => {
  try {
    const borrowedBooks = await BorrowRecord.findAll({
      where: { userId: req.user.id, returnedAt: null },
      include: {
        model: Book,
        attributes: ['title', 'author', 'category'],
      },
    });
    if (borrowedBooks.length === 0) {
      return reply.status(404).send({ message: 'You have not borrowed any books' });
    }
    const result = {
      BookCount: borrowedBooks.length,
      Books: borrowedBooks.map((record) => ({
        Title: record.Book.title,
        Author: record.Book.author,
        Category: record.Book.category,
        BorrowedDate: record.borrowedAt,
      })),
    };
    reply.send(result);
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    reply.status(500).send({ error: 'Failed to fetch borrowed books' });
  }
};

exports.viewMyReturnedBooks = async (req, reply) => {
  try {
    const returnedBooks = await BorrowRecord.findAll({
      where: { userId: req.user.id, returnedAt: { [Op.ne]: null } },
      include: {
        model: Book,
        attributes: ['title', 'author', 'category'],
      },
    });
    if (returnedBooks.length === 0) {
      return reply.status(404).send({ message: 'You have not returned any books' });
    }
    const result = {
      ReturnedBookCount: returnedBooks.length,
      Books: returnedBooks.map((record) => ({
        Title: record.Book.title,
        Author: record.Book.author,
        Category: record.Book.category,
        BorrowedDate: record.borrowedAt,
        ReturnedDate: record.returnedAt,
      })),
    };
    reply.send(result);
  } catch (error) {
    console.error('Error fetching returned books:', error);
    reply.status(500).send({ error: 'Failed to fetch returned books' });
  }
};

exports.viewAllBooks = async (req, reply) => {
  try {
    const books = await Book.findAll({
      attributes: ['title', 'author', 'category'],
    });
    const result = new Map();
    books.forEach(ommpr => {
      const category = ommpr.category;
      if (!result.has(category)) {
        result.set(category,
          {
            books: [],
            count: 0,
          });
      }
      result.get(category).books.push({
        Title: ommpr.title,
        Author: ommpr.author
      });
      result.get(category).count += 1;
    });
    const fff = Array.from(result.entries()).map(([category, data]) => ({
      category,
      bookCount: data.count,
      books: data.books,
    }));

    reply.send(fff);
  } catch (error) {
    console.error('Error fetching books:', error);
    reply.status(500).send({ message: 'Failed to retrieve books' });
  }
};

exports.mostPopularBooks = async (req, reply) => {
  try {
    const mostPopularBooks = await BorrowRecord.findAll({
      include: [
        {
          model: Book,
          attributes: ['id', 'title', 'category'],
        },
      ],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('bookId')), 'borrowCount'],
      ],
      group: ['bookId'],
      order: [[sequelize.fn('COUNT', sequelize.col('bookId')), 'DESC']],
      limit: 3,
    });

    if (!mostPopularBooks || mostPopularBooks.length === 0) {
      return reply.status(404).send({ message: 'No borrow records found' });
    }
    const result = mostPopularBooks.map(item => {
      const book = item.Book;
      const borrowCount = item.dataValues.borrowCount;
      return {
        bookTitle: book.title,
        category: book.category,
        borrowCount,
      };
    });
    reply.send({
      message: 'Most popular Books',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching most popular books:', error);
    reply.status(500).send({ error: 'Failed to fetch most popular books' });
  }
};

exports.mostBorrowedBookInCategory = async (req, reply) => {
  const { category } = req.params;
  try {
    const mostBorrowedBook = await BorrowRecord.findAll({
      include: [
        {
          model: Book,
          where: { category },
          attributes: ['id', 'title', 'category'],
        },
      ],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('bookId')), 'borrowCount'],
      ],
      group: ['bookId'],
      order: [[sequelize.fn('COUNT', sequelize.col('bookId')), 'DESC']],
      limit: 3,
    });
    if (!mostBorrowedBook || mostBorrowedBook.length === 0) {
      return reply.status(404).send({ message: 'No books found in this category or no borrow records' });
    }
    const book = mostBorrowedBook[0].Book;
    const borrowCount = mostBorrowedBook[0].dataValues.borrowCount;

    reply.send({
      message: 'Most borrowed book in the category found',
      data: {
        bookTitle: book.title,
        category: book.category,
        borrowCount,
      },
    });
  } catch (error) {
    console.error('Error fetching most borrowed book:', error);
    reply.status(500).send({ error: 'Failed to fetch most borrowed book' });
  }
};

exports.getUserProfile = async (req, reply) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['username', 'coins']
    });
    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }
    reply.status(200).send({
      username: user.username,
      coinsbalance: user.coins,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    reply.status(500).send({ error: 'Failed to fetch user profile' });
  }
};

exports.totalSpendCoin = async (req, reply) => {
  const userId = req.user.id;
  try {
    const userCoinData = await User.findOne({
      where: { id: userId },
      include: [{
        model: CoinTransaction,
        attributes: [],
      }],
      attributes: [
        'username',
        [sequelize.fn('SUM', sequelize.col('CoinTransactions.amount')), 'totalSpentCoins'],
      ],
      group: ['User.id'],
    });
    if (!userCoinData) {
      return reply.status(404).send({ message: 'User not found or no spent transactions' });
    }
    return reply.status(200).send({
      message: 'Total Spent Coins',
      data: userCoinData,
    });
  } catch (error) {
    console.error('Error retrieving total spent coins for user:', error);
    return reply.status(500).send({ message: 'Failed to fetch total spent coins for user' });
  }
};
