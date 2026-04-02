const rateLimit = require("express-rate-limit");

function apiRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = { apiRateLimit };

