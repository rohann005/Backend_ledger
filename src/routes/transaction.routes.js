const express = require('express');
const  authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controllers/Transaction.controller');

const transactionRoutes =  express.Router();

transactionRoutes.post('/',authMiddleware.authMiddleware, transactionController.createTransaction);





module.exports = transactionRoutes;