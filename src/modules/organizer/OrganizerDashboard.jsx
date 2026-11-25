import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  STORAGE_KEYS,
  parse,
  save,
  defaultTournaments,
  defaultTournamentRequests,
  defaultAnnouncements,
  defaultLiveMatchState
} from "../../services/storage";
import { WebRTCManager } from "../../services/webrtc";

export const OrganizerDashboard = ({ onOpenWebRTCModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [announcements, setAnnouncements] = useState([]);

  const [requestForm, setRequestForm] = useState({
    name: "",
    game: "",
    date: "",
    mode: "Online",
    prize: "",
    description: ""
  });
  const [requestAlert, setRequestAlert] = useState("");

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");

  const [matchData, setMatchData] = useState(defaultLiveMatchState);
  const [webrtcStatus, setWebrtcStatus] = useState({
    isConnected: false,
    packetsSent: 0,
    channelState: "listening"
  });
  const [broadcastAlert, setBroadcastAlert] = useState("");
  const broadcasterRef = useRef(null);

  useEffect(() => {
    loadData();

    broadcasterRef.current = new WebRTCManager(
      "broadcaster",
      null,
      (status) => {
        setWebrtcStatus((prev) => ({ ...prev, ...status }));
      }
    );

    const handleStorageChange = () => loadData();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("gtp-db-synced", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("gtp-db-synced", handleStorageChange);
      if (broadcasterRef.current) {
        broadcasterRef.current.destroy();
      }
    };
  }, []);

  const loadData = () => {
    setTournaments(parse(STORAGE_KEYS.tournaments, defaultTournaments));
    setRequests(parse(STORAGE_KEYS.tournamentRequests, defaultTournamentRequests));
    setRegistrations(parse(STORAGE_KEYS.registrations, {}));
    setAnnouncements(parse(STORAGE_KEYS.announcements, defaultAnnouncements));
    setMatchData(parse(STORAGE_KEYS.liveMatchState, defaultLiveMatchState));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!requestForm.name.trim() || !requestForm.date.trim()) return;

    const id =
      requestForm.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Date.now().toString().slice(-4);

    const newRequest = {
      id,
      name: requestForm.name.trim(),
      game: requestForm.game.trim() || "Custom Game",
      date: requestForm.date.trim(),
      mode: requestForm.mode,
      prize: requestForm.prize.trim() || "Trophy",
      description:
        requestForm.description.trim() || "Competitive gaming tournament.",
      requestedBy: user?.username || "Organizer",
      requestedByEmail: user?.email || "organizer@gtp.com",
      requestedAt: new Date().toISOString(),
      status: "Pending"
    };

    const currentRequests = parse(
      STORAGE_KEYS.tournamentRequests,
      defaultTournamentRequests
    );
    const updated = [...currentRequests, newRequest];
    save(STORAGE_KEYS.tournamentRequests, updated);
    setRequests(updated);

    setRequestForm({
      name: "",
      game: "",
      date: "",
      mode: "Online",
      prize: "",
      description: ""
    });
    setRequestAlert(`Request for "${newRequest.name}" sent to Admin queue.`);
    setTimeout(() => setRequestAlert(""), 4000);
  };

  const handleWithdrawRequest = (id) => {
    const currentRequests = parse(
      STORAGE_KEYS.tournamentRequests,
      defaultTournamentRequests
    );
    const updated = currentRequests.filter((r) => r.id !== id);
    save(STORAGE_KEYS.tournamentRequests, updated);
    setRequests(updated);
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    const msg = announcementText.trim();
    if (!msg) return;

    const current = parse(STORAGE_KEYS.announcements, defaultAnnouncements);
    const updated = [msg, ...current.slice(0, 15)];
    save(STORAGE_KEYS.announcements, updated);
    setAnnouncements(updated);
    setAnnouncementText("");
    setAnnouncementMsg("Live announcement posted!");
    setTimeout(() => setAnnouncementMsg(""), 3500);
  };

  const handleBroadcastTelemetry = (e) => {
    e.preventDefault();
    const updatedState = {
      ...matchData,
      lastUpdated: new Date().toLocaleTimeString()
    };
    save(STORAGE_KEYS.liveMatchState, updatedState);
    setMatchData(updatedState);

    let sent = false;
    if (broadcasterRef.current) {
      const res = broadcasterRef.current.broadcastGameData(updatedState);
      sent = res.sentViaRTC;
    }

    setBroadcastAlert(
      sent
        ? "Game telemetry packet transmitted via WebRTC Data Channel!"
        : "Match state updated and broadcasted across tabs."
    );
    setTimeout(() => setBroadcastAlert(""), 4000);
  };

  const pendingQueue = requests.filter((r) => r.status === "Pending");
  const myRequests =
    user?.role === "admin"
      ? requests
      : requests.filter(
          (r) =>
            !r.requestedByEmail ||
            r.requestedByEmail.toLowerCase() === user?.email?.toLowerCase()
        );

  return (
    <main className="container">
      <header className="page-header panel">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="module-badge module-badge-admin">Organizer Module</span>
            <span className="webrtc-badge">
              <span className="pulse-dot"></span>
              WebRTC P2P Broadcaster
            </span>
          </div>
          <h1 id="welcome-text" style={{ margin: "0.5rem 0 0" }}>
            Welcome, {user?.username || "Organizer"}
          </h1>
          <p id="role-text" className="muted" style={{ margin: "2px 0 0" }}>
            Role: {user?.role || "organizer"} • Request Tournaments, Track Approvals & Broadcast Matches
          </p>
        </div>

        <nav className="page-links">
          <Link to="/">Home</Link>
          <Link to="/player">Player View</Link>
          <Link to="/spectator">Spectator View</Link>
          {user?.role === "admin" && <Link to="/admin">Admin Queue</Link>}
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenWebRTCModal}
            style={{ fontSize: "0.85rem", padding: "6px 12px" }}
          >
            Verify WebRTC
          </button>
          <button
            id="logout-btn"
            className="logout-btn"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      <section className="grid portal-grid">
        {/* Request Tournament Registration */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Request Tournament Registration</h3>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
              Send a tournament request to the Admin approval queue.
            </p>
          </div>

          <form onSubmit={handleSendRequest} className="stack">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "0.8rem"
              }}
            >
              <label>
                Tournament Name
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Legends Winter Split"
                  value={requestForm.name}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, name: e.target.value })
                  }
                />
              </label>
              <label>
                Game Title
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Legends"
                  value={requestForm.game}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, game: e.target.value })
                  }
                />
              </label>
              <label>
                Schedule / Date
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-11-02 19:00"
                  value={requestForm.date}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, date: e.target.value })
                  }
                />
              </label>
              <label>
                Format / Mode
                <select
                  value={requestForm.mode}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, mode: e.target.value })
                  }
                >
                  <option value="Online">Online</option>
                  <option value="In-person">In-person LAN</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </label>
              <label>
                Prize Pool Details
                <input
                  type="text"
                  placeholder="e.g. $1,200 Cash + Trophy"
                  value={requestForm.prize}
                  onChange={(e) =>
                    setRequestForm({ ...requestForm, prize: e.target.value })
                  }
                />
              </label>
              <label>
                Short Description
                <input
                  type="text"
                  placeholder="Tournament rules and details..."
                  value={requestForm.description}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      description: e.target.value
                    })
                  }
                />
              </label>
            </div>
            <button
              type="submit"
              style={{ width: "auto", alignSelf: "flex-start", marginTop: "0.5rem" }}
            >
              Send Request to Admin
            </button>
          </form>

          {requestAlert && (
            <p style={{ margin: "0.6rem 0 0", color: "#86efac", fontSize: "0.88rem" }}>
              {requestAlert}
            </p>
          )}
        </article>

        {/* Submitted Requests Status */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h3 style={{ margin: 0 }}>My Tournament Requests</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                Track status of tournaments sent to the Admin queue ({pendingQueue.length} pending overall)
              </p>
            </div>
          </div>

          {myRequests.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              No tournament requests submitted yet.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.8rem" }}>
              {myRequests.map((req) => {
                const queueIdx = pendingQueue.findIndex((p) => p.id === req.id);
                const statusColor =
                  req.status === "Accepted"
                    ? "#86efac"
                    : req.status === "Rejected"
                    ? "var(--danger)"
                    : "#fa9a00";
                return (
                  <div
                    key={req.id}
                    style={{
                      background: "rgba(15, 26, 45, 0.7)",
                      border: "1px solid #2d3e58",
                      borderRadius: "10px",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "0.6rem"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                        <strong style={{ fontSize: "1.05rem", color: "#f8fafc" }}>
                          {req.name}
                        </strong>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: statusColor }}>
                          {req.status === "Pending" && queueIdx !== -1
                            ? `Pending (#${queueIdx + 1})`
                            : req.status}
                        </span>
                      </div>
                      <p className="muted" style={{ fontSize: "0.85rem", margin: "4px 0" }}>
                        {req.game} • {req.date} • {req.mode}
                      </p>
                      <p style={{ fontSize: "0.88rem", margin: "4px 0", color: "#fa9a00" }}>
                        Prize: {req.prize || "Trophy"}
                      </p>
                      <p style={{ fontSize: "0.83rem", margin: "4px 0 0", color: "#cbd5e1" }}>
                        {req.description}
                      </p>
                    </div>

                    {req.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => handleWithdrawRequest(req.id)}
                        style={{
                          background: "transparent",
                          color: "var(--danger)",
                          border: "1px solid rgba(248, 113, 113, 0.4)",
                          padding: "4px 8px",
                          fontSize: "0.78rem",
                          borderRadius: "6px",
                          alignSelf: "flex-start"
                        }}
                      >
                        Withdraw Request
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </article>

        {/* Registered Tournaments */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ marginBottom: "0.8rem" }}>Registered Tournaments</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.8rem" }}>
            {tournaments.map((t) => {
              const enrolled = registrations[t.id] || [];
              return (
                <div
                  key={t.id}
                  style={{
                    background: "rgba(15, 26, 45, 0.7)",
                    border: "1px solid #2d3e58",
                    borderRadius: "10px",
                    padding: "1rem"
                  }}
                >
                  <strong style={{ fontSize: "1.05rem", color: "#f8fafc" }}>{t.name}</strong>
                  <p className="muted" style={{ fontSize: "0.85rem", margin: "4px 0" }}>
                    {t.game} • {t.date} • {t.mode}
                  </p>
                  <p style={{ fontSize: "0.88rem", margin: "4px 0", color: "#fa9a00" }}>
                    Prize: {t.prize}
                  </p>
                  <p style={{ fontSize: "0.85rem", margin: "4px 0 0", color: "#cbd5e1" }}>
                    Registered Players: <strong>{enrolled.length}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        {/* WebRTC Match Broadcaster */}
        <article className="panel" style={{ border: "1px solid rgba(74, 222, 128, 0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "var(--accent)" }}>WebRTC Match Broadcaster</h3>
            <span className="webrtc-badge">
              <span className="pulse-dot"></span>
              Packets: {webrtcStatus.packetsSent}
            </span>
          </div>
          <p className="muted" style={{ fontSize: "0.82rem", margin: "4px 0 1rem" }}>
            Push live match changes directly via WebRTC DataChannel
          </p>

          <form onSubmit={handleBroadcastTelemetry} className="stack">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <label>
                Team A Name
                <input
                  type="text"
                  value={matchData.teamA}
                  onChange={(e) => setMatchData({ ...matchData, teamA: e.target.value })}
                  required
                />
              </label>
              <label>
                Team B Name
                <input
                  type="text"
                  value={matchData.teamB}
                  onChange={(e) => setMatchData({ ...matchData, teamB: e.target.value })}
                  required
                />
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              <label>
                Score A
                <input
                  type="number"
                  min="0"
                  value={matchData.scoreA}
                  onChange={(e) => setMatchData({ ...matchData, scoreA: Number(e.target.value) })}
                  required
                />
              </label>
              <label>
                Score B
                <input
                  type="number"
                  min="0"
                  value={matchData.scoreB}
                  onChange={(e) => setMatchData({ ...matchData, scoreB: Number(e.target.value) })}
                  required
                />
              </label>
              <label>
                Round #
                <input
                  type="number"
                  min="1"
                  value={matchData.round}
                  onChange={(e) => setMatchData({ ...matchData, round: Number(e.target.value) })}
                  required
                />
              </label>
            </div>
            <label>
              Live Event Description
              <input
                type="text"
                value={matchData.recentEvent}
                onChange={(e) => setMatchData({ ...matchData, recentEvent: e.target.value })}
                required
              />
            </label>
            <button type="submit" style={{ background: "var(--accent)", color: "#0b1120", fontWeight: 700 }}>
              Broadcast Changes via WebRTC
            </button>
          </form>

          {broadcastAlert && (
            <p style={{ margin: "0.6rem 0 0", color: "#86efac", fontSize: "0.85rem", fontWeight: 600 }}>
              {broadcastAlert}
            </p>
          )}
        </article>

        {/* Post Live Update */}
        <article className="panel">
          <h3>Post Live Update</h3>
          <form onSubmit={handleAnnouncementSubmit} className="stack">
            <label>
              Broadcast Message
              <input
                type="text"
                placeholder="Announce match delays, brackets, or winners..."
                required
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
              />
            </label>
            <button type="submit">Publish Announcement</button>
          </form>
          {announcementMsg && (
            <p style={{ margin: "0.6rem 0 0", color: "#86efac", fontSize: "0.88rem" }}>
              {announcementMsg}
            </p>
          )}

          <h4 style={{ margin: "1.2rem 0 0.5rem" }}>Recent Announcements Feed</h4>
          <ul className="content-list">
            {announcements.slice(0, 6).map((entry, idx) => (
              <li key={idx}>{entry}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
};
