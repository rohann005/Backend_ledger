const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });

  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount) {
    return res.status(404).json({ message: "From account not found" });
  }

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res
        .status(200)
        .json({
          message: "Transaction already completed",
          transaction: isTransactionAlreadyExists,
        });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res
        .status(200)
        .json({
          message: "Transaction is still pending",
          transaction: isTransactionAlreadyExists,
        });
    }

    if (isTransactionAlreadyExists.status === "FAILED") {
      return res
        .status(500)
        .json({
          message: "Transaction failed previously",
          transaction: isTransactionAlreadyExists,
        });
    }

    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res
        .status(500)
        .json({
          message: "Transaction was reversed previously",
          transaction: isTransactionAlreadyExists,
        });
    }
  }
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res
      .status(400)
      .json({ message: "One or both accounts are not active" });
  }

  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res.status(400).json({ message: "Insufficient balance " });
  }

  const session = await mongoose.startSession();

  session.startTransaction(
    {
      fromAccount,
      toAccount,
      Amount,
      idempotencykey,
      status: "PENDING",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  await session.commitTransaction();
  session.endSession();

  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );
  return res.status(201).json({ message: "Email sent of Transaction" });
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount , amount and idempotencyKey are required",
    });
  }
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }
  const fromUserAccount = await accountModel.findOne({
    
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "system User account not found",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initila funds transaction completed successful",
    transaction: transaction,
  });
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction
};
