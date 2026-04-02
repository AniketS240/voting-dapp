const Candidate = require("../models/Candidate");
const blockchainService = require("../services/blockchainService");

async function getCandidatesController(req, res) {
  const [electionActive, chainCandidates] = await Promise.all([
    blockchainService.getElectionActive(),
    blockchainService.getCandidates(),
  ]);

  const candidateIds = chainCandidates.map((c) => c.id);
  const metas = await Candidate.find(
    { candidateId: { $in: candidateIds } },
    { _id: 0, candidateId: 1, description: 1, imageUrl: 1, name: 1 }
  ).lean();

  const metaById = new Map(metas.map((m) => [m.candidateId, m]));

  const candidates = chainCandidates.map((c) => {
    const meta = metaById.get(c.id);
    return {
      id: c.id,
      name: meta?.name && meta.name !== "" ? meta.name : c.name,
      voteCount: c.voteCount,
      description: meta?.description || "",
      imageUrl: meta?.imageUrl || "",
    };
  });

  return res.json({ electionActive, candidates });
}

module.exports = { getCandidatesController };

