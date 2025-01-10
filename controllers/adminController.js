const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const CoinTransaction = require('../models/CoinTransaction');
const bcrypt=require('bcryptjs');
const sequelize = require('../config/database');
const Op = sequelize;
const Sequelize = require('sequelize');

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
        message: 'Borrowed books are Here',
        data: result,
      });
    } catch (error) {
      console.error('Error retrieving borrowed books:', error);
      reply.status(500).send({ error: 'Failed to fetch borrowed books' });
    }
  };
  exports.createBook = async (req, reply) => {
    try {
      const { title, author, category, stock, priceInCoins, isFree } = req.body;
  
      if (!title || !author || !category) {
        return reply.status(400).send({ message: 'Title, author, and category are required' });
      }
  
      const existingBook = await Book.findOne({ where: { title } });
      if (existingBook) {
        return reply.status(400).send({ message: 'A book with this title already exists' });
      }

      const validStock = Number.isInteger(Number(stock)) ? Number(stock) : 0;
  
      let finalPriceInCoins = 0; 
      if (isFree !== undefined && isFree !== null) {
        if (isFree) {
          
          if (priceInCoins && priceInCoins > 0) {
            return reply.status(400).send({
              message: 'It is free book cant add coin ',
            });
          }
          finalPriceInCoins = 0;  
        } else {    
          if (!priceInCoins || priceInCoins <= 0) {
            return reply.status(400).send({
              message: 'It is not free plz add coin',
            });
          }
          finalPriceInCoins = Number(priceInCoins);
        }
      }     
      const newBook = await Book.create({
        title,
        author,
        category,
        stock: validStock,
        priceInCoins: finalPriceInCoins,
        isFree: isFree === undefined || isFree === null ? false : isFree,
      });
    
      return reply.status(201).send({
        message: 'Book created successfully',
        book: newBook,
      });
    } catch (error) {
      console.error('Error creating book:', error);
      return reply.status(500).send({ message: 'Failed to create book' });
    }
  };
   
module.exports.updateBook = async (req, reply) => {
  try {
    const { id } = req.params;
    const { title, author, category, priceInCoins, isFree, stock } = req.body;

    const book = await Book.findByPk(id);
    if (!book) {
      return reply.status(404).send({ message: 'Book not found' });
    }

    const updatedFields = {};
    if (title) {
      book.title = title;
      updatedFields.title = title;
    }
    if (author) {
      book.author = author;
      updatedFields.author = author;
    }
    if (category) {
      book.category = category;
      updatedFields.category = category;
    }

    if (isFree !== undefined && isFree !== '') {
      if (isFree) {
        if (priceInCoins && priceInCoins > 0) {
          return reply.status(400).send({
            message: 'It is free book cant add coin ',
          });
        }
        book.isFree = true;
        book.priceInCoins = 0;
        updatedFields.isFree = true;
        updatedFields.priceInCoins = 0;
      } else {
        if (!priceInCoins || priceInCoins <= 0) {
          return reply.status(400).send({
            message:'It is not free plz add coin',
          });
        }
        book.isFree = false;
        book.priceInCoins = priceInCoins;
        updatedFields.isFree = false;
        updatedFields.priceInCoins = priceInCoins;
      }
    }

    if (stock !== undefined && stock !== '') {
      book.stock = stock;
      updatedFields.stock = stock;
    }

    await book.save();

    return reply.status(200).send({
      message: 'Book updated successfully',
      updatedFields,
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return reply.status(500).send({ message: 'Internal Server Error' });
  }
};
 
exports.viewBooks = async (req, reply) => {
  try {
    const books = await Book.findAll({ 
      attributes: ['title', 'author', 'category'],
    });

    const result = new Map();
    books.forEach((book) => {
      const category = book.category;
      if (!result.has(category)) {
        result.set(category, { 
          books: [], 
          count: 0 
        });
      }
      result.get(category).books.push({
        Title: book.title,
        Author: book.author,
      });
      result.get(category).count += 1;
    });
    const finalResult = Array.from(result.entries()).map(([category, data]) => ({
      category,
      bookCount: data.count,
      books: data.books,
    }));

    reply.send(finalResult);
  } catch (error) {
    console.error('Error fetching books:', error);
    reply.status(500).send({ message: 'Failed to retrieve books' });
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
module.exports.UpdateUser = async (req, reply) => {
    try {
        const { id } = req.params;
        const { username, password, role } = req.body;       
        if (username) {
            const existingUser = await User.findOne({ where: { username, id: { [Op.ne]: id } } });
            if (existingUser) {
                return reply.code(400).send({ status: false, message: "Username is already taken by another user." });
            }
        }      
        const validRole = ['user']; 
        if (role && !validRole.includes(role)) {
            return reply.code(400).send({ status: false, message: "Invalid role: choose User" });
        }     
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;    
        const updateData = {};
        if (username) updateData.username = username;
        if (password) updateData.password = hashedPassword;
        if (role) updateData.role = role;      
        const updatedUser = await User.update(updateData, { where: { id } });   
        if (Object.keys(updateData).length === 0) {
          return reply.code(400).send({
            status: false,
            message: "User not updated any information.",
          });
        } 
        if (updatedUser[0] === 0) { 
            return reply.code(404).send({ status: false, message: "User not found" });
        }         
        reply.send({ status: true, message: "User updated successfully", user: updateData });

    } catch (err) {
        console.error("Error during user update:", err);
        reply.code(500).send({ status: false, error: err.message, message: "Failed to update user" });
    }
};

exports.DeleteUser=async (req, reply)=>{
  const {id}=req.params;
  try{
    const user=await User.findByPk(id);
    if(!user) return reply.code(404).send({message:"User not found"});
    await user.destroy();
    return reply.code(200).send({message:"User Deleted Successfully"});
  }catch(err){
    return reply.code(404).send({error: err.message});
  }
};

exports.viewUser = async (req, reply) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 
        'username', 
        'coins',
        [Sequelize.fn('COUNT', Sequelize.col('borrowrecords.id')), 'borrowcount'], 
      ],
      include: [
        {
          model: BorrowRecord, 
          attributes: [], 
        },
      ],
      where: { role: 'user' }, 
      group: ['User.id'], 
    });
    if (!users || users.length === 0) {
      return reply.code(404).send({ message: "No users found" }); 
    }
    return reply.code(200).send(users); 
  } catch (err) {
    return reply.code(500).send({ error: err.message }); 
  }
};

module.exports.setBookPrice = async (req, reply) => {
  try {
    const { bookId, priceInCoins } = req.body;
    
    const book = await Book.findByPk(bookId);
    
    if (!book) {
      return reply.status(404).send({ message: 'Book not found' });
    }
    
    book.priceInCoins = priceInCoins;
    await book.save();
    
    return reply.status(200).send({
      message: 'Book price set successfully',
      data: { bookId, priceInCoins },
    });
  } catch (error) {
    console.error('Error setting book price:', error);
    return reply.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.addCoinsToUser = async (req, reply) => {
  try {
    if (req.user.role !== 'admin') {
      return reply.status(403).send({ message: 'Permission denied' });
    }
    const { userId, coins } = req.body;
    if (isNaN(coins) || coins <= 0 || coins === "") {
      return reply.status(400).send({ message: 'Invalid number of coins' });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }
    await CoinTransaction.create({
      userId,
      amount: coins,
    });
    user.coins = (user.coins || 0) + coins;
    await user.save();
    return reply.status(200).send({
      message: `Successfully added ${coins} coins to user ${userId}`,
      user: {
        id: user.id,
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error('Error adding coins to user:', error);
    return reply.status(500).send({ message: 'Internal Server Error' });
  }
};

exports.vipuser= async (req, reply) => {
  try {
    const usersWithTotalCoins = await User.findAll({
      where: { role: 'user' }, 
      include: [{
        model: CoinTransaction,
        attributes: [],
      }],
      attributes: [
        'id',
        'username',
        [sequelize.fn('SUM', sequelize.col('CoinTransactions.amount')), 'totalCoins'],
      ],
      group: ['User.id'],
      order: [[sequelize.col('totalCoins'), 'DESC']], 
    });
    if (!usersWithTotalCoins || usersWithTotalCoins.length === 0) {
      return reply.status(404).send({ message: 'No users found' });
    }
    return reply.status(200).send({
      message: 'Users and their total coins',
      data: usersWithTotalCoins,
    });
  } catch (error) {
    console.error('Error retrieving total coins for users:', error);
    return reply.status(500).send({ message: 'Failed to fetch users\' total coins' });
  }
};

