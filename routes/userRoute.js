const { authenticate, authorizeRole } =require('../middleware/authMiddleware');  
const userController = require('../controllers/userController');  

const userRoutes = async function (fastify) {
    
    fastify.addHook('preHandler', authenticate);  
    fastify.get('/books/category/:category', { preHandler: authorizeRole(['user']) }, userController.viewBooksByCategory);
    fastify.post('/borrow/:bookId', { preHandler: authorizeRole(['user']) }, userController.borrowBook);
    fastify.post('/return/:bookId', { preHandler: authorizeRole(['user']) }, userController.returnBook);
    fastify.get('/borrowed-books', { preHandler: authorizeRole(['user']) }, userController.viewMyBorrowedBooks);
    fastify.get('/returned-books', { preHandler: authorizeRole(['user']) }, userController.viewMyReturnedBooks);
    fastify.get('/books', { preHandler: authorizeRole(['user']) },userController.viewAllBooks);
    fastify.get('/most-popular-books', { preHandler: authorizeRole(['user']) }, userController.mostPopularBooks);
    fastify.get('/most-borrowed-book/:category', { preHandler: authorizeRole(['user']) }, userController.mostBorrowedBookInCategory);
    fastify.post('/buybook', { preHandler: authorizeRole(['user']) }, userController.buyBookWithCoins);
    fastify.get('/viewprofile', { preHandler: authorizeRole(['user']) }, userController.getUserProfile);
 



 };

module.exports = userRoutes;
