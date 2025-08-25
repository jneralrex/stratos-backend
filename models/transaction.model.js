const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  receipt: {
    url: { type: String },
    public_id: { type: String },
  },
  status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
