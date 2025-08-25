const Commission = require("../models/commission.models");
const User = require("../models/user.model");

// ✅ Get affiliate earnings (total commissions)
const getAffiliateEarnings = async (req, res) => {
  try {
    const userId = req.user._id;

    const commissions = await Commission.find({ user: userId });

    const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);
    const approvedEarnings = commissions
      .filter(c => c.status === "approved")
      .reduce((sum, c) => sum + c.amount, 0);
    const pendingEarnings = commissions
      .filter(c => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);

    return res.json({
      success: true,
      data: {
        totalEarnings,
        approvedEarnings,
        pendingEarnings,
        commissions, // optional: return all commission records
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get affiliate referrals
const getAffiliateReferrals = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all users referred by this affiliate
    const referrals = await User.find({ referredBy: userId }).select("fullName email username createdAt");

    return res.json({
      success: true,
      count: referrals.length,
      referrals,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAffiliateEarnings,
  getAffiliateReferrals,
};
