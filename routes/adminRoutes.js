const { authenticate, authorizeRole } = require('../middleware/authMiddleware');  
const adminController = require('../controllers/adminController');  

module.exports = async function (fastify) {

fastify.addHook('preHandler', authenticate); 

fastify.get('/admin/borrowed-books', { preHandler: authorizeRole(['admin']) }, adminController.viewBorrowedBooks);
fastify.get('/viewuser', { preHandler: authorizeRole(['admin']) }, adminController.viewUser);
fastify.get('/admin/books',  { preHandler: authorizeRole(['admin']) },adminController.viewBooks); 
fastify.get('/vipuser',{ preHandler: authorizeRole(['admin']) }, adminController.vipuser);
fastify.post('/admin/books', { preHandler: authorizeRole(['admin']) }, adminController.createBook); 
fastify.post('/admin/users', { preHandler: authorizeRole(['admin']) }, adminController.createUser); 
fastify.post('/addcoin', { preHandler: authorizeRole(['admin']) }, adminController.addCoinsToUser);
fastify.put('/admin/books/:id',  { preHandler: authorizeRole(['admin']) },adminController.updateBook); 
fastify.put('/admin/updateusers/:id', { preHandler: authorizeRole(['admin']) }, adminController.UpdateUser);
fastify.put('/set-book-price', { preHandler: authorizeRole(['admin']) }, adminController.setBookPrice);
fastify.delete('/admin/books/:id',  { preHandler: authorizeRole(['admin']) },adminController.deleteBook);
fastify.delete('/deleteuser/:id',  { preHandler: authorizeRole(['admin']) },adminController.DeleteUser);
};
