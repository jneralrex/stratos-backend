const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

//  Login limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 attempts per window per user/IP
  keyGenerator: (req) => {
    const safeIp = ipKeyGenerator(req); // handles IPv4 & IPv6 safely
    return req.body?.email ? `${safeIp}-${req.body.email}` : safeIp;
  },
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

module.exports = { loginLimiter };
