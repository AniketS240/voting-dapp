import { ethers } from "ethers";

function getExpectedChainId() {
  const v = process.env.REACT_APP_EXPECTED_CHAIN_ID;
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return String(Math.trunc(n));
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const expectedChainId = getExpectedChainId();

  const provider = new ethers.BrowserProvider(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  const { chainId } = await provider.getNetwork();
  const networkOk =
    expectedChainId === null ? true : chainId.toString() === expectedChainId;

  if (!networkOk) {
    throw new Error(
      `Wrong network. Please connect to chainId ${expectedChainId} (Hardhat localhost).`
    );
  }

  return { provider, signer, address, chainId, networkOk };
}

export async function getCurrentWallet() {
  if (!window.ethereum) return null;
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (!accounts || accounts.length === 0) return null;

  const signer = await provider.getSigner();
  const address = accounts[0];
  const { chainId } = await provider.getNetwork();

  const expectedChainId = getExpectedChainId();
  const networkOk =
    expectedChainId === null ? true : chainId.toString() === expectedChainId;

  return { provider, signer, address, chainId, networkOk };
}