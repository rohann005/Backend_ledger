const {Router} = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const transactionRoutes = Router();

transactionRoutes.post('/',);





module.exports = transactionRoutes;