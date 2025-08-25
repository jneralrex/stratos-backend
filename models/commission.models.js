const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["referral", "sale"], required: true },
  status: { type: String, enum: ["pending", "approved", "paid"], default: "pending" },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Commission = mongoose.model("Commission", commissionSchema);
module.exports = Commission;
