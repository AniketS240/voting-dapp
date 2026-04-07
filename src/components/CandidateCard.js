function CandidateCard({
  candidate,
  canVote,
  onVote,
  isVoting,
  disabled,
}) {
  const disabledReason = disabled ? "Voting disabled" : !canVote ? "Not eligible" : "";

  return (
    <div className={`card ${disabled ? "card-disabled" : ""}`} aria-label={disabledReason}>
      <div className="card-header">
        <h2 className="card-title">{candidate.name}</h2>
      </div>

      <div className="card-body">
        <div className="vote-stats">
          <div className="vote-count">{candidate.voteCount}</div>
          <div className="vote-label">votes</div>
        </div>

        {candidate.imageUrl ? (
          <img
            className="candidate-image"
            alt={`${candidate.name}`}
            src={candidate.imageUrl}
          />
        ) : null}

        <div className="vote-progress-row">
          <div className="vote-progress-label">Total share</div>
          <div className="vote-progress-bar">
            <div
              className="vote-progress-fill"
              style={{ width: `${candidate.voteSharePct || 0}%` }}
            />
          </div>
          <div className="vote-progress-value">{candidate.voteSharePct || 0}%</div>
        </div>
      </div>

      <button
        className="vote-btn"
        onClick={() => onVote(candidate.id)}
        disabled={disabled || !canVote || isVoting}
      >
        {isVoting ? "Submitting..." : canVote ? "Vote" : "Not eligible"}
      </button>
    </div>
  );
}

export default CandidateCard;