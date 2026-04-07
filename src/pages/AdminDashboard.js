import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import "./AdminDashboard.css";

import {
  getContractReadOnly,
  getReadProvider,
} from "../services/contract";
import {
  apiAdminAddCandidate,
  apiAdminEndElection,
  apiAdminStartElection,
  apiAdminAddToWhitelist,
} from "../services/api";

function Toasts({ toasts, onDismiss }) {
  return (
    <div className="admin-toasts" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-msg">{t.message}</div>
          <button className="toast-x" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const [adminApiKey, setAdminApiKey] = useState(
    process.env.REACT_APP_ADMIN_API_KEY || ""
  );

  const [chainLoading, setChainLoading] = useState(true);
  const [electionActive, setElectionActive] = useState(false);
  const [candidateCount, setCandidateCount] = useState(0);

  const [candidateName, setCandidateName] = useState("");
  const [whitelistAddress, setWhitelistAddress] = useState("");

  const [loadingCandidateAdd, setLoadingCandidateAdd] = useState(false);
  const [loadingStartElection, setLoadingStartElection] = useState(false);
  const [loadingEndElection, setLoadingEndElection] = useState(false);
  const [loadingWhitelist, setLoadingWhitelist] = useState(false);

  const [toasts, setToasts] = useState([]);
  const toastTimeouts = useMemo(() => new Map(), []);

  function pushToast(type, message, ttlMs = 4000) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // auto-dismiss
    const timeout = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      const existing = toastTimeouts.get(id);
      if (existing) toastTimeouts.delete(id);
    }, ttlMs);
    toastTimeouts.set(id, timeout);
  }

  function dismissToast(id) {
    const existing = toastTimeouts.get(id);
    if (existing) window.clearTimeout(existing);
    toastTimeouts.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function refreshChainStats() {
    setChainLoading(true);
    try {
      const provider = getReadProvider();
      const contract = getContractReadOnly(provider);

      const [active, countBig] = await Promise.all([
        contract.electionActive(),
        contract.candidateCount(),
      ]);

      setElectionActive(Boolean(active));
      setCandidateCount(Number(countBig));
    } catch (e) {
      pushToast("error", e?.message || "Failed to load chain stats");
    } finally {
      setChainLoading(false);
    }
  }

  useEffect(() => {
    refreshChainStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensureAdminKey() {
    if (adminApiKey && adminApiKey.trim() !== "") return true;
    pushToast("error", "Admin API key is required for admin actions.");
    return false;
  }

  async function onAddCandidate() {
    const name = candidateName.trim();
    if (!name) {
      pushToast("error", "Candidate name is required.");
      return;
    }
    if (!(await ensureAdminKey())) return;

    setLoadingCandidateAdd(true);
    try {
      await apiAdminAddCandidate({ name }, adminApiKey);
      pushToast("success", "Candidate added.");
      setCandidateName("");
      await refreshChainStats();
    } catch (e) {
      pushToast("error", e?.message || "Failed to add candidate");
    } finally {
      setLoadingCandidateAdd(false);
    }
  }

  async function onStartElection() {
    if (!(await ensureAdminKey())) return;
    setLoadingStartElection(true);
    try {
      await apiAdminStartElection(adminApiKey);
      pushToast("success", "Election started.");
      await refreshChainStats();
    } catch (e) {
      pushToast("error", e?.message || "Failed to start election");
    } finally {
      setLoadingStartElection(false);
    }
  }

  async function onEndElection() {
    if (!(await ensureAdminKey())) return;
    setLoadingEndElection(true);
    try {
      await apiAdminEndElection(adminApiKey);
      pushToast("success", "Election ended.");
      await refreshChainStats();
    } catch (e) {
      pushToast("error", e?.message || "Failed to end election");
    } finally {
      setLoadingEndElection(false);
    }
  }

  async function onAddToWhitelist() {
    if (!(await ensureAdminKey())) return;

    const raw = whitelistAddress.trim();
    if (!raw) {
      pushToast("error", "Wallet address is required.");
      return;
    }
    if (!ethers.isAddress(raw)) {
      pushToast("error", "Invalid wallet address.");
      return;
    }

    setLoadingWhitelist(true);
    try {
      const normalized = ethers.getAddress(raw);
      await apiAdminAddToWhitelist(normalized, adminApiKey);
      pushToast("success", "User whitelisted.");
      setWhitelistAddress("");
    } catch (e) {
      pushToast("error", e?.message || "Failed to whitelist user");
    } finally {
      setLoadingWhitelist(false);
    }
  }

  return (
    <div className="admin-wrap">
      <Toasts toasts={toasts} onDismiss={dismissToast} />

      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="admin-subtitle">
            Election status and management (read via chain, writes via backend).
          </div>
        </div>

        <div className="admin-stats">
          <div className="pill">
            Status:{" "}
            <span className={electionActive ? "pill-ok" : "pill-off"}>
              {chainLoading ? "..." : electionActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="pill">
            Candidates:{" "}
            <span className="pill-count">{chainLoading ? "..." : candidateCount}</span>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <h2 className="card-title">Election Controls</h2>
          <p className="card-help">Start or end the voting period using admin backend calls.</p>

          <div className="field">
            <button
              className="btn btn-primary"
              onClick={onStartElection}
              disabled={loadingStartElection}
            >
              {loadingStartElection ? "Starting..." : "Start Election"}
            </button>
          </div>

          <div className="field">
            <button
              className="btn btn-danger"
              onClick={onEndElection}
              disabled={loadingEndElection}
            >
              {loadingEndElection ? "Ending..." : "End Election"}
            </button>
          </div>

          <div className="divider" />

          <button className="btn btn-ghost" onClick={refreshChainStats} disabled={chainLoading}>
            {chainLoading ? "Refreshing..." : "Refresh Status"}
          </button>
        </section>

        <section className="admin-card">
          <h2 className="card-title">Candidate Management</h2>
          <p className="card-help">Adds a candidate on-chain and stores metadata (description/image optional).</p>

          <div className="field">
            <label className="label" htmlFor="candidateName">Candidate name</label>
            <input
              id="candidateName"
              className="input"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g., Alice"
              disabled={loadingCandidateAdd}
            />
          </div>

          <div className="field">
            <button
              className="btn btn-primary"
              onClick={onAddCandidate}
              disabled={loadingCandidateAdd}
            >
              {loadingCandidateAdd ? "Adding..." : "Add Candidate"}
            </button>
          </div>
        </section>

        <section className="admin-card">
          <h2 className="card-title">Whitelist Management</h2>
          <p className="card-help">Whitelist a wallet address (admin backend call).</p>

          <div className="field">
            <label className="label" htmlFor="adminKey">Admin API key (dev-only)</label>
            <input
              id="adminKey"
              className="input"
              type="password"
              value={adminApiKey}
              onChange={(e) => setAdminApiKey(e.target.value)}
              placeholder="Paste admin key"
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="whitelistAddress">Wallet address</label>
            <input
              id="whitelistAddress"
              className="input"
              value={whitelistAddress}
              onChange={(e) => setWhitelistAddress(e.target.value)}
              placeholder="0x..."
              disabled={loadingWhitelist}
            />
          </div>

          <div className="field">
            <button
              className="btn btn-primary"
              onClick={onAddToWhitelist}
              disabled={loadingWhitelist}
            >
              {loadingWhitelist ? "Whitelisting..." : "Add to Whitelist"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;

