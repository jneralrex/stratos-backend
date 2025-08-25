const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    countryOfResidence: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    profilePics: {
      url: { type: String },
      public_id: { type: String },
    },
    gender: { 
      type: String, 
      trim: true, 
      lowercase: true, 
      enum: ["male", "female"] 
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          return value < new Date(); // Ensures DOB is in the past
        },
        message: "Date of birth cannot be in the future",
      },
    },
    managedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    password: { type: String, required: true, select: false },
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    isVerified: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["student", "affiliate", "salesRep", "superAdmin"],
      default: "student",
    },
 course: {
    type: String,
    validate: {
      validator: function (v) {
        // Only students must have a course
        if (this.role === "student") return typeof v === "string" && v.trim().length > 0;
        return true;
      },
      message: "Students must select a course",
    },
  },
    commissions: {
      totalEarned: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      paidOut: { type: Number, default: 0 },
    },

    // ✅ Referral system
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    referralCode: { type: String, unique: true, sparse: true }, // main referral code
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

// ✅ Auto set `isProfileComplete`
userSchema.pre("save", function (next) {
  this.isProfileComplete =
    !!this.username &&
    !!this.email &&
    !!this.profilePics?.url &&
    !!this.gender &&
    !!this.dateOfBirth;
  next();
});

// ✅ Generate referral code if missing (only for affiliates)
userSchema.pre("save", function (next) {
  if (this.role === "affiliate" && !this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString("hex");
  }

  // Ensure non-affiliates never keep referral codes
  if (this.role !== "affiliate") {
    this.referralCode = undefined;  // ✅ remove field entirely
  }

  next();
});

// 🌍 Virtual field for referral link (only for affiliates)
userSchema.virtual("refLink").get(function () {
  if (this.role !== "affiliate" || !this.referralCode) return null;
  return `${process.env.FRONTEND_URL}/stratuslab/courses/register?ref=${this.referralCode}`;
});

// Ensure virtuals are included in JSON responses
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
