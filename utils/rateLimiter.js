const rateLimit = require("express-rate-limit");

//  Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 attempts per window per user/IP
  keyGenerator: (req) => {
    // Use email + IP so different users on same IP don't block each other
    return req.body?.email ? `${req.ip}-${req.body.email}` : req.ip;
  },
  message: {
    success: false,
    message: "Too many login attempts. Please try again later."
  }
});

module.exports = { loginLimiter };
