const { env } = require("../config/env");

function adminAuth(req, res, next) {
  const provided = req.header("x-admin-key");
  if (!provided) return res.status(401).json({ message: "Admin key missing" });
  if (provided !== env.ADMIN_API_KEY)
    return res.status(403).json({ message: "Invalid admin key" });
  return next();
}

module.exports = { adminAuth };

