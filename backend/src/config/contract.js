const fs = require("fs");
const path = require("path");
const { env } = require("./env");
const { ethers } = require("ethers");

const abiPath = path.join(__dirname, "..", "abi", "Voting.json");
const votingAbi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

function getRpcProvider() {
  return new ethers.JsonRpcProvider(env.RPC_URL);
}

function getAdminWallet(provider) {
  // Admin key is used ONLY on the backend for admin transactions.
  return new ethers.Wallet(env.ADMIN_PRIVATE_KEY, provider);
}

async function assertChainId(provider) {
  if (!env.EXPECTED_CHAIN_ID) return;
  const network = await provider.getNetwork();
  const expected = BigInt(env.EXPECTED_CHAIN_ID);
  if (network.chainId !== expected) {
    const error = new Error(
      `Unexpected chainId. Expected ${expected.toString()}, got ${network.chainId.toString()}`
    );
    error.statusCode = 400;
    throw error;
  }
}

async function getVotingContract() {
  const provider = getRpcProvider();
  await assertChainId(provider);

  const contractAddress = env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error("CONTRACT_ADDRESS is not configured");
  if (!ethers.isAddress(contractAddress)) {
    const error = new Error("CONTRACT_ADDRESS is not a valid EVM address");
    error.statusCode = 400;
    throw error;
  }

  return {
    provider,
    adminWallet: getAdminWallet(provider),
    contractAddress,
    abi: votingAbi,
  };
}

module.exports = { getVotingContract };

