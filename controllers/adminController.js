const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const bcrypt=require('bcryptjs');

exports.viewBorrowedBooks = async (req, reply) => {
    try {
        const borrowRecords = await BorrowRecord.findAll({
        include: [
          {
            model: User,
            attributes: ['username'], 
          },
          {
            model: Book,
            attributes: ['title'], 
          },
        ],
      });
  
      if (borrowRecords.length === 0) {
        return reply.status(404).send({ message: 'No borrowed books found' });
      }
  
      const result = borrowRecords.map((record) => ({
        Username: record.User.username,
        BookTitle: record.Book.title,
        BorrowedDate: record.borrowedAt,
        ReturnedDate: record.returnedAt || 'Not returned yet',
      }));
  
      reply.send({
        message: 'Borrowed books data retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error retrieving borrowed books:', error);
      reply.status(500).send({ error: 'Failed to fetch borrowed books' });
    }
  };
  

exports.createBook = async (req, reply) => {
    try {
      const { title, author, category } = req.body;
         if (!title || !author || !category) {
        return reply.status(400).send({ message: 'All fields are required' });
      }
      const existingBook = await Book.findOne({ where: { title } });
      if (existingBook) {
        return reply.status(400).send({ message: 'A book with this title already exists' });
      }
         const newBook = await Book.create({
        title,
        author,
        category,
      });
       reply.status(201).send({ message: 'Book created successfully', book: newBook });
    } catch (error) {
      console.error('Error creating book:', error);
      reply.status(500).send({ message: 'Failed to create book' });
    }
  };
  
  exports.viewBooks = async (req, reply) => {
    try {
      const books = await Book.findAll({ 
        attributes: ['title', 'author', 'category'],
 }); 
       reply.send(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      reply.status(500).send({ message: 'Failed to retrieve books' });
    }
  };
  
 
  exports.updateBook = async (req, reply) => {
    try {
      const { id } = req.params;
      const { title, author, category, stock } = req.body; 
      const book = await Book.findByPk(id);
  
      if (!book) {
        return reply.status(404).send({ message: 'Book not found' });
      }
      if (title) book.title = title;
      if (author) book.author = author;
      if (category) book.category = category;
      if (stock !== undefined) book.stock = stock;  
      await book.save();
  
      const updatedFields = {};
      if (title) updatedFields.title = book.title;
      if (author) updatedFields.author = book.author;
      if (category) updatedFields.category = book.category;
      if (stock !== undefined) updatedFields.stock = book.stock;
  
      reply.send({ message: 'Book updated successfully', updatedFields });
    } catch (error) {
      console.error('Error updating book:', error);
      reply.status(500).send({ message: 'Failed to update book' });
    }
  };
  
  exports.deleteBook = async (req, reply) => {
    try {
      const { id } = req.params;
      const book = await Book.findByPk(id);
     if (!book) {
        return reply.status(404).send({ message: 'Book not found' });
      }
      await book.destroy(); 
      reply.send({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      reply.status(500).send({ message: 'Failed to delete book' });
    }
};


module.exports.createUser = async (req, reply) => {
    try {
        const { username, password } = req.body;     
        if (!username || !password) {
            return reply.code(400).send({ 
                status: false, 
                message: "Username and password are required" 
            });
        }   
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return reply.code(400).send({
                status: false,
                message: "Username already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);     
        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: "user",  
        }); 
        reply.send({
            status: true,
            message: "User created successfully",
            user: newUser
        });
    } catch (err) {
        console.error("Error creating user:", err);   
        reply.code(500).send({
            status: false,
            error: err.message,
            message: "Failed to create user"
        });
    }
};
