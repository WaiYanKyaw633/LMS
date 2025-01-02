const authController = require('../controllers/authController');

module.exports = async (app) => {
  app.post('/login', authController.login);
};
