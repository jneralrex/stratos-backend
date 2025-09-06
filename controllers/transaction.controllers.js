// controllers/transaction.controller.js
const Commission = require("../models/commission.models");
const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");

// Commission rates (easy to update later)
const AFFILIATE_RATE = 0.1; // 10%
const SALES_REP_RATE = 0.05; // 5%

// Confirm Transaction + distribute commissions
const confirmTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const salesRepId = req.user._id; // from auth middleware

    const transaction = await Transaction.findById(transactionId).populate("student");
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });
    if (transaction.status !== "pending") {
      return res.status(400).json({ success: false, message: "Transaction already processed" });
    }

    // confirm transaction
    transaction.status = "confirmed";
    transaction.confirmedBy = salesRepId;
    await transaction.save();

    const student = transaction.student;
    const affiliate = await User.findById(student.referredBy);

    // Create affiliate commission (10%)
    if (affiliate) {
      await Commission.create({
        user: affiliate._id,
        amount: transaction.amount * AFFILIATE_RATE,
        type: "referral",
        status: "approved",
        referredUser: student._id,
      });
    }

    // Create sales rep commission (5%)
    await Commission.create({
      user: salesRepId,
      amount: transaction.amount * SALES_REP_RATE,
      type: "sale",
      status: "approved",
      referredUser: student._id,
    });

    return res.json({ success: true, message: "Transaction confirmed and commissions distributed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reject Transaction
const rejectTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });
    if (transaction.status !== "pending") {
      return res.status(400).json({ success: false, message: "Transaction already processed" });
    }

    transaction.status = "rejected";
    await transaction.save();

    return res.json({ success: true, message: "Transaction rejected" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create Transaction
const createTransaction = async (req, res) => {
  try {
    const { studentId, amount } = req.body;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const transaction = new Transaction({
      student: student._id,
      amount,
      receipt: req.file
        ? {
            url: req.file.path,
            public_id: req.file.filename,
          }
        : undefined, // fallback if no file uploaded
    });

    await transaction.save();
    return res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Update Transaction
const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { amount, receiptUrl, receiptPublicId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    // 🚨 Ownership check: students can only update their own
    if (req.user.role === "student" && transaction.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own transactions" });
    }

    if (amount) transaction.amount = amount;
    if (receiptUrl) transaction.receipt.url = receiptUrl;
    if (receiptPublicId) transaction.receipt.public_id = receiptPublicId;

    await transaction.save();
    return res.json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findByIdAndDelete(transactionId);
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });

    return res.json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Get Transactions (all or by filter)
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("student confirmedBy", "username email");
    return res.json({ success: true, transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Transaction by ID (with ownership check)
const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate("student confirmedBy", "username email");

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // 🚨 Ownership check: student can only view their own
    if (req.user.role === "student" && transaction.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only view your own transactions" });
    }

    return res.json({ success: true, transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get Transactions for Logged-in User (student dashboard)
const getTransactionsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ student: userId }).populate("student confirmedBy", "username email");
    return res.json({ success: true, transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getTransactionsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["pending", "confirmed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const transactions = await Transaction.find({ status }).populate("student confirmedBy", "username email");
    return res.json({ success: true, transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export all controllers
module.exports = {
  confirmTransaction,
  rejectTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionById,
  getTransactionsByUser,
  getTransactionsByStatus,
};
