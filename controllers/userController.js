const { BorrowRecord, Book ,Coin } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sequelize = require('sequelize'); 



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
      
      await Book.decrement('stock', { by: 1, where: { id: bookId } });
      await Book.update({ isBorrowed: true }, { where: { id: bookId } });
      const borrowRecord = await BorrowRecord.create({
        userId: req.user.id,
        bookId,
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
        return reply.status(404).send({ message: 'No such borrowed book record found' });
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
  
      if (books.length === 0) {
        return reply.status(404).send({ message: 'No books found' });
      }
  
      reply.send(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      reply.status(500).send({ error: 'Failed to fetch books' });
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
  

exports.buyCoins = async (req, reply) => {
  const { amount } = req.body; 
  if (!amount || amount <= 0) {
    return reply.status(400).send({ message: 'Invalid coin amount' });
  }
  try {
   const user = await User.findByPk(req.user.id);
    user.coins += amount;
    await user.save();

    await Coin.create({
      userId: req.user.id,
      amount,
    });

      reply.status(200).send({
      message: `Successfully bought ${amount} coins.`,
      coins: user.coins,
    });
  } catch (error) {
    console.error('Error buying coins:', error);
    reply.status(500).send({ error: 'Failed to buy coins' });
  }
};


exports.buyBookWithCoins = async (req,reply) => {
  try {
    const { userId, bookId } = req.body;
    
    const book = await Book.findByPk(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const user = await User.findByPk(userId);    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (book.isFree) {
      return res.status(200).json({ message: 'Book purchased successfully for free' });
    }
    if (user.coins < book.priceInCoins) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }
    user.coins -= book.priceInCoins;
    await user.save();

    await UserBook.create({ userId, bookId });
    return res.status(200).json({
      message: 'Book purchased successfully with coins',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};