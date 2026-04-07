import AlertBanner from "./AlertBanner";

function Navbar({
  walletAddress,
  networkOk,
  onConnect,
  connecting,
  alert,
  route,
  onNavigateAdmin,
  onNavigateVote,
}) {
  return (
    <div className="navbar">
      <div className="logo">Voting DApp</div>

      <div className="navbar-right">
        <div className="nav-tabs">
          <button
            className={`nav-tab-btn ${route === "vote" ? "active" : ""}`}
            onClick={onNavigateVote}
          >
            Voting
          </button>
          <button
            className={`nav-tab-btn ${route === "admin" ? "active" : ""}`}
            onClick={onNavigateAdmin}
          >
            Admin
          </button>
        </div>

        {walletAddress ? (
          <div className="wallet-address">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        ) : null}

        {walletAddress && networkOk === false ? (
          <div className="network-warn">Wrong network (Hardhat localhost)</div>
        ) : null}

        {!walletAddress ? (
          <button
            className="wallet-btn"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting..." : "Connect MetaMask"}
          </button>
        ) : null}
      </div>

      {alert ? (
        <AlertBanner type={alert.type} message={alert.message} />
      ) : null}
    </div>
  );
}

export default Navbar;