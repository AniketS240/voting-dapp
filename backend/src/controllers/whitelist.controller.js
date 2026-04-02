const User = require("../models/User");
const blockchainService = require("../services/blockchainService");

async function addWhitelistController(req, res) {
  const { walletAddress } = req.body;
  const normalized = blockchainService.normalizeAddress(walletAddress);

  await blockchainService.addToWhitelist(normalized);

  const user = await User.findOneAndUpdate(
    { walletAddress: normalized },
    { $set: { isWhitelisted: true } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({
    walletAddress: normalized,
    isWhitelisted: user.isWhitelisted,
    hasVoted: user.hasVoted,
  });
}

async function removeWhitelistController(req, res) {
  const { walletAddress } = req.body;
  const normalized = blockchainService.normalizeAddress(walletAddress);

  await blockchainService.removeFromWhitelist(normalized);

  const user = await User.findOneAndUpdate(
    { walletAddress: normalized },
    { $set: { isWhitelisted: false } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({
    walletAddress: normalized,
    isWhitelisted: user.isWhitelisted,
    hasVoted: user.hasVoted,
  });
}

async function getWhitelistController(req, res) {
  const { address } = req.params;
  const normalized = blockchainService.normalizeAddress(address);

  const { isWhitelisted, hasVoted } =
    await blockchainService.getWhitelistStatus(normalized);

  const user = await User.findOneAndUpdate(
    { walletAddress: normalized },
    { $set: { isWhitelisted, hasVoted } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({
    walletAddress: normalized,
    isWhitelisted: user.isWhitelisted,
    hasVoted: user.hasVoted,
    createdAt: user.createdAt,
  });
}

module.exports = {
  addWhitelistController,
  removeWhitelistController,
  getWhitelistController,
};

