import { ethers } from "ethers";
import abi from "../abi/Voting.json";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const expectedChainId = process.env.REACT_APP_EXPECTED_CHAIN_ID
  ? Number(process.env.REACT_APP_EXPECTED_CHAIN_ID)
  : null;
const rpcUrl = process.env.REACT_APP_RPC_URL || "http://127.0.0.1:8545";

function assertContractConfigured() {
  if (!contractAddress) {
    throw new Error("REACT_APP_CONTRACT_ADDRESS is not configured");
  }
  if (!ethers.isAddress(contractAddress)) {
    throw new Error("REACT_APP_CONTRACT_ADDRESS is not a valid EVM address");
  }
}

export function getContractReadOnly(provider) {
  assertContractConfigured();
  return new ethers.Contract(contractAddress, abi, provider);
}

export function getContractWithSigner(signer) {
  assertContractConfigured();
  return new ethers.Contract(contractAddress, abi, signer);
}

export function getContractAdminReadOnly(provider) {
  assertContractConfigured();
  if (expectedChainId === null) return getContractReadOnly(provider);
  return getContractReadOnly(provider);
}

export function getReadProvider(windowProvider) {
  // Prefer MetaMask provider for consistent network reads;
  // fall back to a local JSON-RPC provider when wallet isn't connected.
  if (windowProvider) return windowProvider;
  return new ethers.JsonRpcProvider(rpcUrl);
}