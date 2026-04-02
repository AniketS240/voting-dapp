const User = require("../models/User");
const blockchainService = require("../services/blockchainService");
const { parseCandidateId } = require("../utils/validate");

async function validateVoteController(req, res) {
  const { walletAddress, candidateId } = req.body;
  const normalized = blockchainService.normalizeAddress(walletAddress);
  const candidateIdNum = parseCandidateId(candidateId);

  const [electionActive, flags, candidate] = await Promise.all([
    blockchainService.getElectionActive(),
    blockchainService.getWhitelistStatus(normalized),
    blockchainService.getCandidate(candidateIdNum),
  ]);

  const candidateExists = candidate && candidate.id === candidateIdNum && candidate.name !== "";

  const canVote =
    electionActive &&
    flags.isWhitelisted &&
    !flags.hasVoted &&
    candidateExists;

  const reason = !candidateExists
    ? "Invalid candidate"
    : !electionActive
      ? "Election is not active"
      : !flags.isWhitelisted
        ? "Wallet is not whitelisted"
        : flags.hasVoted
          ? "Already voted"
          : "Not eligible to vote";

  await User.findOneAndUpdate(
    { walletAddress: normalized },
    { $set: { isWhitelisted: flags.isWhitelisted, hasVoted: flags.hasVoted } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.json({
    walletAddress: normalized,
    candidate: {
      id: candidate.id,
      name: candidate.name,
      voteCount: candidate.voteCount,
    },
    electionActive,
    isWhitelisted: flags.isWhitelisted,
    hasVoted: flags.hasVoted,
    candidateExists,
    canVote,
    reason: canVote ? null : reason,
  });
}

module.exports = { validateVoteController };

