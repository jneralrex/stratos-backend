const express = require("express");
const router = express.Router();
const authorize = require("../utils/authorize");
const authenticate = require("../utils/authenticate");
const { getAffiliateEarnings, getAffiliateReferrals } = require("../controllers/affiliate.controller");

// Affiliate earnings
router.get("/earnings", authenticate, authorize("affiliate", "admin"), getAffiliateEarnings);

// Affiliate referrals
router.get("/referrals", authenticate, authorize("affiliate", "admin"), getAffiliateReferrals);

module.exports = router;
