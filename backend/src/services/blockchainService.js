const { ethers } = require("ethers");
const { getVotingContract } = require("../config/contract");

let cachePromise = null;

async function getResources() {
  if (!cachePromise) cachePromise = getVotingContract();
  return cachePromise;
}

function getReadContract(resources) {
  return new ethers.Contract(resources.contractAddress, resources.abi, resources.provider);
}

function getWriteContract(resources) {
  const c = getReadContract(resources);
  return c.connect(resources.adminWallet);
}

function normalizeAddress(address) {
  return ethers.getAddress(address);
}

async function getElectionActive() {
  const resources = await getResources();
  const contract = getReadContract(resources);
  return contract.electionActive();
}

async function getCandidateCount() {
  const resources = await getResources();
  const contract = getReadContract(resources);
  return contract.candidateCount();
}

async function getCandidate(candidateId) {
  const resources = await getResources();
  const contract = getReadContract(resources);
  const c = await contract.candidates(candidateId);
  // c: { id, name, voteCount } (struct)
  return {
    id: Number(c.id),
    name: c.name,
    voteCount: Number(c.voteCount),
  };
}

async function getCandidates() {
  const resources = await getResources();
  const contract = getReadContract(resources);
  const countBig = await contract.candidateCount();
  const count = Number(countBig);
  const ids = Array.from({ length: count }, (_, idx) => idx + 1);
  const candidates = await Promise.all(ids.map((id) => contract.candidates(id)));
  return candidates.map((c) => ({
    id: Number(c.id),
    name: c.name,
    voteCount: Number(c.voteCount),
  }));
}

async function getWhitelistStatus(walletAddress) {
  const resources = await getResources();
  const contract = getReadContract(resources);
  const addr = normalizeAddress(walletAddress);
  const [isWhitelisted, hasVoted] = await Promise.all([
    contract.whitelist(addr),
    contract.hasVoted(addr),
  ]);
  return { isWhitelisted, hasVoted };
}

async function addToWhitelist(walletAddress) {
  const resources = await getResources();
  const contract = getWriteContract(resources);
  const addr = normalizeAddress(walletAddress);
  const tx = await contract.addToWhitelist(addr);
  return tx.wait();
}

async function removeFromWhitelist(walletAddress) {
  const resources = await getResources();
  const contract = getWriteContract(resources);
  const addr = normalizeAddress(walletAddress);
  const tx = await contract.removeFromWhitelist(addr);
  return tx.wait();
}

async function addCandidate(name) {
  const resources = await getResources();
  const contract = getWriteContract(resources);
  const tx = await contract.addCandidate(name);
  return tx.wait();
}

async function startElection() {
  const resources = await getResources();
  const contract = getWriteContract(resources);
  const tx = await contract.startElection();
  return tx.wait();
}

async function endElection() {
  const resources = await getResources();
  const contract = getWriteContract(resources);
  const tx = await contract.endElection();
  return tx.wait();
}

module.exports = {
  normalizeAddress,
  getElectionActive,
  getCandidateCount,
  getCandidate,
  getCandidates,
  getWhitelistStatus,
  addToWhitelist,
  removeFromWhitelist,
  addCandidate,
  startElection,
  endElection,
};

