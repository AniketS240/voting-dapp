const Candidate = require("../models/Candidate");
const ElectionState = require("../models/ElectionState");
const blockchainService = require("../services/blockchainService");
const { sanitizeString } = require("../utils/validate");

async function adminAddCandidateController(req, res) {
  const { name, description, imageUrl } = req.body;
  const nameSanitized = sanitizeString(name, { min: 1, max: 100 });

  // Get candidateCount before tx so we can deterministically assign the new id.
  const beforeCount = Number(await blockchainService.getCandidateCount());

  const txReceipt = await blockchainService.addCandidate(nameSanitized);
  void txReceipt; // receipt used by tx in production; here we only need the id

  const candidateId = beforeCount + 1;

  const descriptionSanitized = sanitizeString(description, { min: 0, max: 500 });
  const imageUrlSanitized = sanitizeString(imageUrl, { min: 0, max: 5000 });

  await Candidate.findOneAndUpdate(
    { candidateId },
    {
      $set: {
        candidateId,
        name: nameSanitized,
        description: descriptionSanitized ?? "",
        imageUrl: imageUrlSanitized ?? "",
      },
    },
    { upsert: true, new: true }
  );

  return res.json({ candidateId });
}

async function adminStartElectionController(req, res) {
  await blockchainService.startElection();

  await ElectionState.findOneAndUpdate(
    {},
    { $set: { electionActive: true } },
    { upsert: true, new: true }
  );

  return res.json({ ok: true, electionActive: true });
}

async function adminEndElectionController(req, res) {
  await blockchainService.endElection();

  await ElectionState.findOneAndUpdate(
    {},
    { $set: { electionActive: false } },
    { upsert: true, new: true }
  );

  return res.json({ ok: true, electionActive: false });
}

module.exports = {
  adminAddCandidateController,
  adminStartElectionController,
  adminEndElectionController,
};

