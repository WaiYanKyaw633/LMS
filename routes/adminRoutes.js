const { authenticate, authorizeRole } = require('../middleware/authMiddleware');  
const adminController = require('../controllers/adminController');  

module.exports = async function (fastify) {

fastify.addHook('preHandler', authenticate); 

fastify.get('/admin/borrowed-books', { preHandler: authorizeRole(['admin']) }, adminController.viewBorrowedBooks);
  fastify.post('/admin/books', { preHandler: authorizeRole(['admin']) }, adminController.createBook); 
  fastify.get('/admin/books',  { preHandler: authorizeRole(['admin']) },adminController.viewBooks); 
  fastify.put('/admin/books/:id',  { preHandler: authorizeRole(['admin']) },adminController.updateBook); 
  fastify.delete('/admin/books/:id',  { preHandler: authorizeRole(['admin']) },adminController.deleteBook);
  fastify.post('/admin/users', { preHandler: authorizeRole(['admin']) }, adminController.createUser); 
  fastify.put('/admin/updateusers/:id', { preHandler: authorizeRole(['admin']) }, adminController.UpdateUser);
  fastify.put('/set-book-price', { preHandler: authorizeRole(['admin']) }, adminController.setBookPrice);
  fastify.put('/set-book-free', { preHandler: authorizeRole(['admin']) }, adminController.setBookFree);
  fastify.post('/addcoin/:id', { preHandler: authorizeRole(['admin']) }, adminController.setBookFree);
};
