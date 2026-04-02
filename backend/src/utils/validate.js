const { ethers } = require("ethers");

function isValidAddress(address) {
  try {
    ethers.getAddress(address);
    return true;
  } catch {
    return false;
  }
}

function parseCandidateId(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function sanitizeString(input, { min = 0, max = 256 } = {}) {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (trimmed.length < min || trimmed.length > max) return null;
  return trimmed;
}

module.exports = { isValidAddress, parseCandidateId, sanitizeString };

