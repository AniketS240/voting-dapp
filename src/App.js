import "./App.css";
import "./styles/accessibility.css";
import Navbar from "./components/Navbar";
import VotingPage from "./pages/VotingPage";
import AdminDashboard from "./pages/AdminDashboard";
import { useEffect, useState } from "react";
import { connectWallet, getCurrentWallet } from "./services/wallet";

function App() {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [navAlert, setNavAlert] = useState(null);
  const [route, setRoute] = useState(() => {
    return window.location.hash === "#/admin" ? "admin" : "vote";
  });

  useEffect(() => {
    (async () => {
      try {
        const current = await getCurrentWallet();
        if (current) setWallet(current);
      } catch (e) {
        // ignore auto-connect errors
      }
    })();
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        const current = await getCurrentWallet();
        if (!cancelled) setWallet(current);
      } catch (e) {
        // If MetaMask is in a bad state, just clear wallet UI.
        if (!cancelled) setWallet(null);
      }
    };

    window.ethereum.on("accountsChanged", refresh);
    window.ethereum.on("chainChanged", refresh);

    return () => {
      cancelled = true;
      window.ethereum.removeListener("accountsChanged", refresh);
      window.ethereum.removeListener("chainChanged", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash === "#/admin" ? "admin" : "vote");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  async function onConnect() {
    setConnecting(true);
    setNavAlert(null);
    try {
      const w = await connectWallet();
      setWallet(w);
      setNavAlert({ type: "success", message: "Wallet connected." });
      setTimeout(() => setNavAlert(null), 2500);
    } catch (e) {
      setNavAlert({ type: "error", message: e?.message || "Failed to connect wallet." });
    } finally {
      setConnecting(false);
    }
  }

  function navigateAdmin() {
    window.location.hash = "#/admin";
  }

  function navigateVote() {
    window.location.hash = "#/";
  }

  return (
    <div className="app">
      <Navbar
        walletAddress={wallet?.address}
        networkOk={wallet?.networkOk}
        onConnect={onConnect}
        connecting={connecting}
        alert={navAlert}
        route={route}
        onNavigateAdmin={navigateAdmin}
        onNavigateVote={navigateVote}
      />
      {route === "admin" ? <AdminDashboard /> : <VotingPage wallet={wallet} />}
    </div>
  );
}

export default App;