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
  authorize("student", "admin"), // only students (or admins for testing) can create
  uploadRecieptImage.single("receipt"),
  createTransaction
);

// Update transaction (student or admin)
router.put(
  "/:transactionId",
  authenticate,
  authorize("student", "admin"),
 updateTransaction
);

// Delete transaction (admin only)
router.delete(
  "/:transactionId",
  authenticate,
  authorize("admin"),
  deleteTransaction
);

// Confirm transaction (salesRep only)
router.post(
  "/:transactionId/confirm",
  authenticate,
  authorize("salesRep", "admin"),
  confirmTransaction
);

// Reject transaction (salesRep only)
router.post(
  "/:transactionId/reject",
  authenticate,
  authorize("salesRep", "admin"),
  rejectTransaction
);

// Get all transactions (admin only)
router.get(
  "/",
  authenticate,
  authorize("admin", "affiliate"),
  getTransactions
);

// Get transaction by ID (admin, salesRep, or student who owns it)
router.get(
  "/:transactionId",
  authenticate,
  authorize("admin", "salesRep", "student"),
  getTransactionById
);

// Get transactions for logged-in user (student dashboard)
router.get(
  "/user/me",
  authenticate,
  authorize("student", "admin"),
  getTransactionsByUser
);

// Get transactions by status (admin or salesRep)
router.get(
  "/status/:status",
  authenticate,
  authorize("admin", "salesRep"),
  getTransactionsByStatus
);

module.exports = router;
