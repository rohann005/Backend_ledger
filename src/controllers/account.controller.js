const accountModel = require('../models/account.model');

async function createAccountController(req, res) {
   const user = req.user; // Assuming the user is attached to the request object by the auth middleware
   const account = await accountModel.create({ user: user._id });
   res.status(201).json({ message: 'Account created successfully', account });
}
module.exports = { createAccountController };