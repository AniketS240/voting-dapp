const express = require("express");
const authRoutes = require("./auth.routes");
const whitelistRoutes = require("./whitelist.routes");
const voteRoutes = require("./vote.routes");
const candidatesRoutes = require("./candidates.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/whitelist", whitelistRoutes);
router.use("/vote", voteRoutes);
router.use("/candidates", candidatesRoutes);
router.use("/admin", adminRoutes);

module.exports = router;

