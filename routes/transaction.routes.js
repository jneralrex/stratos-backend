const express = require("express");
const router = express.Router();
const { createTransaction, updateTransaction, deleteTransaction, confirmTransaction, rejectTransaction, getTransactions, getTransactionById, getTransactionsByUser, getTransactionsByStatus } = require("../controllers/transaction.controllers");
const authorize = require("../utils/authorize");
const authenticate = require("../utils/authenticate");
const { uploadRecieptImage } = require("../utils/files/imagesUpload");

// Create a new transaction (student uploads receipt)
router.post(
  "/",
  authenticate,
  authorize("student", "superAdmin"), // only students (or admins for testing) can create
  uploadRecieptImage.single("receipt"),
  createTransaction
);

// Update transaction (student or admin)
router.put(
  "/:transactionId",
  authenticate,
  authorize("student", "superAdmin"),
 updateTransaction
);

// Delete transaction (admin only)
router.delete(
  "/:transactionId",
  authenticate,
  authorize("superAdmin"),
  deleteTransaction
);

// Confirm transaction (salesRep and admin only)
router.post(
  "/:transactionId/confirm",
  authenticate,
  authorize("salesRep", "superAdmin"),
  confirmTransaction
);

// Reject transaction (salesRep and admin only)
router.post(
  "/:transactionId/reject",
  authenticate,
  authorize("salesRep", "superAdmin"),
  rejectTransaction
);

// Get all transactions (admin only)
router.get(
  "/",
  authenticate,
  authorize("superAdmin"),
  getTransactions
);

// Get transaction by ID (admin, salesRep, or student who owns it)
router.get(
  "/:transactionId",
  authenticate,
  authorize("student"),
  getTransactionById
);

// Get transactions for logged-in user (student dashboard)
router.get(
  "/user/me",
  authenticate,
  authorize("student"),
  getTransactionsByUser
);

// Get transactions by status (admin or salesRep)
router.get(
  "/status/:status",
  authenticate,
  authorize("superAdmin", "salesRep"),
  getTransactionsByStatus
);

module.exports = router;
