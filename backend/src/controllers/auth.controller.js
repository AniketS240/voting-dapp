const User = require("../models/User");
const blockchainService = require("../services/blockchainService");

async function connectController(req, res) {
  const { walletAddress } = req.body;
  const normalized = blockchainService.normalizeAddress(walletAddress);

  const [{ isWhitelisted, hasVoted }, electionActive] = await Promise.all([
    blockchainService.getWhitelistStatus(normalized),
    blockchainService.getElectionActive(),
  ]);

  const user = await User.findOneAndUpdate(
    { walletAddress: normalized },
    { $set: { isWhitelisted, hasVoted } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({
    walletAddress: normalized,
    isWhitelisted: user.isWhitelisted,
    hasVoted: user.hasVoted,
    electionActive,
  });
}

module.exports = { connectController };

