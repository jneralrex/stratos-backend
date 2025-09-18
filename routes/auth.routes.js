const express = require("express");
const {
  signUp,
  verifyOTP,
  resendOTP,
  signIn,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  requestDeleteAccount,
  confirmDeleteAccount,
  createUserByAdmin
} = require("../controllers/auth.controller");
const authenticate = require("../utils/authenticate");
const authorize = require("../utils/authorize");
const { loginLimiter } = require("../utils/rateLimiter");

const router = express.Router();

router.post("/signup", signUp);
router.post("/users", authenticate, authorize("superAdmin"), createUserByAdmin);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/signin", loginLimiter, signIn); 
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/change-password", authenticate, changePassword);
router.post("/request-delete", authenticate, requestDeleteAccount);
router.post("/confirm-delete", authenticate, confirmDeleteAccount);

module.exports = router;
