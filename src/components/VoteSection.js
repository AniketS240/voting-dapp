import { useEffect, useMemo, useState } from "react";
import CandidateCard from "./CandidateCard";
import AlertBanner from "./AlertBanner";
import { apiAuthConnect, apiVoteValidate } from "../services/api";
import {
  getContractReadOnly,
  getContractWithSigner,
  getReadProvider,
} from "../services/contract";

function VoteSection({ wallet }) {
  const [candidates, setCandidates] = useState([]);
  const [electionActive, setElectionActive] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const [user, setUser] = useState({
    isWhitelisted: false,
    hasVoted: false,
  });

  const [loadingUser, setLoadingUser] = useState(false);
  const [txPendingCandidateId, setTxPendingCandidateId] = useState(null);
  const [alert, setAlert] = useState(null); // { type, message }

  const totalVotes = useMemo(
    () => candidates.reduce((sum, c) => sum + (Number(c.voteCount) || 0), 0),
    [candidates]
  );

  const candidatesWithShare = useMemo(() => {
    return candidates.map((c) => {
      const share = totalVotes === 0 ? 0 : (Number(c.voteCount) / totalVotes) * 100;
      return { ...c, voteSharePct: Number(share.toFixed(2)) };
    });
  }, [candidates, totalVotes]);

  async function refreshCandidates() {
    setLoadingCandidates(true);
    try {
      const provider = getReadProvider(wallet?.provider);
      const contract = getContractReadOnly(provider);

      const [active, countBig] = await Promise.all([
        contract.electionActive(),
        contract.candidateCount(),
      ]);

      setElectionActive(Boolean(active));

      const count = Number(countBig);
      const ids = Array.from({ length: count }, (_, idx) => idx + 1);

      const chainCandidates = await Promise.all(
        ids.map(async (id) => {
          const c = await contract.candidates(id);
          return {
            id: Number(c.id),
            name: c.name,
            voteCount: Number(c.voteCount),
          };
        })
      );

      setCandidates(chainCandidates);
    } catch (e) {
      setAlert({ type: "error", message: e.message || "Failed to load candidates" });
    } finally {
      setLoadingCandidates(false);
    }
  }

  async function refreshUserState() {
    if (!wallet?.address) return;
    setLoadingUser(true);
    setAlert(null);
    try {
      const data = await apiAuthConnect(wallet.address);
      setUser({
        isWhitelisted: Boolean(data.isWhitelisted),
        hasVoted: Boolean(data.hasVoted),
      });
      // electionActive is fetched on-chain in refreshCandidates()
    } catch (e) {
      setAlert({ type: "error", message: e.message || "Failed to load your status" });
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    refreshCandidates();
    // Poll for real-time updates (vote progress / new candidates)
    const id = setInterval(refreshCandidates, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshUserState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.address]);

  useEffect(() => {
    if (!wallet?.address) return;
    const id = setInterval(refreshUserState, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.address]);

  async function vote(candidateId) {
    if (!wallet?.signer || !wallet.address) {
      setAlert({ type: "error", message: "Connect your wallet first." });
      return;
    }
    if (!wallet.networkOk) {
      setAlert({
        type: "error",
        message: "Wrong network. Switch MetaMask to Hardhat localhost.",
      });
      return;
    }

    setAlert(null);
    setTxPendingCandidateId(candidateId);

    try {
      const validation = await apiVoteValidate({
        walletAddress: wallet.address,
        candidateId,
      });

      if (!validation.canVote) {
        setAlert({ type: "error", message: validation.reason || "Not eligible to vote" });
        return;
      }

      const contract = getContractWithSigner(wallet.signer);
      const tx = await contract.vote(candidateId);

      await tx.wait();

      setAlert({ type: "success", message: "Vote submitted successfully." });
      await refreshCandidates();
      await refreshUserState();
    } catch (e) {
      setAlert({
        type: "error",
        message: e?.message || "Transaction failed. Check MetaMask and try again.",
      });
    } finally {
      setTxPendingCandidateId(null);
    }
  }

  return (
    <div className="container">
      <AlertBanner
        type={alert?.type || "info"}
        message={alert?.message}
        onDismiss={() => setAlert(null)}
      />

      <div className="hero">
        <div>
          <h1 className="title">Election Voting</h1>
          <div className={`election-status ${electionActive ? "ok" : "off"}`}>
            {electionActive ? "Election is active" : "Election is not active"}
          </div>
        </div>

        <div className="user-badge">
          {wallet?.address ? (
            <span className={`user-state ${user.hasVoted ? "voted" : ""}`}>
              {loadingUser ? "Checking eligibility..." : user.hasVoted
                ? "You already voted"
                : user.isWhitelisted
                  ? "Whitelisted"
                  : "Not whitelisted"}
            </span>
          ) : (
            <span className="user-state">Connect wallet to vote</span>
          )}
        </div>
      </div>

      {loadingCandidates ? (
        <div className="loading-grid" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid">
          {candidatesWithShare.map((c) => {
            const eligible =
              electionActive &&
              wallet?.address &&
              wallet.networkOk &&
              user.isWhitelisted &&
              !user.hasVoted;
            return (
              <CandidateCard
                key={c.id}
                candidate={c}
                canVote={eligible}
                onVote={vote}
                isVoting={txPendingCandidateId === c.id}
                disabled={!wallet?.address || !wallet.networkOk}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VoteSection;