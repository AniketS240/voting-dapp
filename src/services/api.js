import axios from "axios";

// Required base URL (can be overridden by env for flexibility).
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

function throwApiError(err) {
  const message =
    err?.response?.data?.message ||
    err?.message ||
    "Request failed";
  throw new Error(message);
}

function adminHeaders(adminApiKey) {
  if (!adminApiKey) return undefined;
  return { "x-admin-key": adminApiKey };
}

// Voting eligibility + validation
export async function apiAuthConnect(walletAddress) {
  try {
    const res = await api.post("/auth/connect", { walletAddress });
    return res.data;
  } catch (err) {
    throwApiError(err);
  }
}

export async function apiVoteValidate({ walletAddress, candidateId }) {
  try {
    const res = await api.post("/vote/validate", { walletAddress, candidateId });
    return res.data;
  } catch (err) {
    throwApiError(err);
  }
}

// Optional helpers
export async function apiGetWhitelist(address) {
  try {
    const res = await api.get(`/whitelist/${address}`);
    return res.data;
  } catch (err) {
    throwApiError(err);
  }
}

export async function apiGetCandidates() {
  try {
    const res = await api.get("/candidates");
    return res.data;
  } catch (err) {
    throwApiError(err);
  }
}

// Admin endpoints
export async function apiAdminAddCandidate({ name, description, imageUrl }, adminApiKey) {
  try {
    const payload = {
      name,
      ...(description ? { description } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    };
    const headers = adminHeaders(adminApiKey);
    const res = await api.post("/admin/add-candidate", payload, headers ? { headers } : undefined);
    return res.data;
  } catch (err) {
    throwApiError(err);
  }
}

export async function apiAdminStartElection(adminApiKey) {
  try {
    const headers = adminHeaders(adminApiKey);
    const res = await api.post("/admin/start-election", {}, headers ? { headers } : undefined);
    return res.data;
  } catch (err) {
    throwApiError(err);
  }
}

export async function apiAdminEndElection(adminApiKey) {
  try {
    const headers = adminHeaders(adminApiKey);
    const res = await api.post("/admin/end-election", {}, headers ? { headers } : undefined);
    return res.data;
  } catch (err) {
    throwApiError(err);
  }
}

export async function apiAdminAddToWhitelist(walletAddress, adminApiKey) {
  try {
    const headers = adminHeaders(adminApiKey);
    const res = await api.post(
      "/whitelist/add",
      { walletAddress },
      headers ? { headers } : undefined
    );
    return res.data;
  } catch (err) {
    throwApiError(err);
  }
}

