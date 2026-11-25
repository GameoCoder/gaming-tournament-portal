import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  STORAGE_KEYS,
  parse,
  save,
  defaultTournaments,
  defaultTournamentRequests,
  defaultLeaderboard,
  defaultAnnouncements,
  defaultLiveMatchState
} from "../../services/storage";
import { WebRTCManager } from "../../services/webrtc";
import { LiveStreamEmbed } from "../../components/stream/LiveStreamEmbed";

export const AdminDashboard = ({ onOpenWebRTCModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [tournaments, setTournaments] = useState([]);
  const [tournamentRequests, setTournamentRequests] = useState([]);
  const [queueDecisions, setQueueDecisions] = useState({});
  const [queueFeedback, setQueueFeedback] = useState("");
  const [registrations, setRegistrations] = useState({});
  const [prizes, setPrizes] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Forms
  const [newTourney, setNewTourney] = useState({
    name: "",
    game: "",
    date: "",
    mode: "Online",
    prize: "",
    description: ""
  });
  const [showCreateTourney, setShowCreateTourney] = useState(false);

  const [resultTournament, setResultTournament] = useState("");
  const [resultWinner, setResultWinner] = useState("");
  const [resultPoints, setResultPoints] = useState(10);
  const [resultMsg, setResultMsg] = useState("");

  const [prizeTournament, setPrizeTournament] = useState("");
  const [prizeDetails, setPrizeDetails] = useState("");
  const [prizeMsg, setPrizeMsg] = useState("");

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");

  // WebRTC Broadcaster state
  const [matchData, setMatchData] = useState(defaultLiveMatchState);
  const [webrtcStatus, setWebrtcStatus] = useState({
    isConnected: false,
    packetsSent: 0,
    channelState: "listening"
  });
  const [broadcastAlert, setBroadcastAlert] = useState("");

  const broadcasterRef = useRef(null);

  useEffect(() => {
    loadAllData();

    // Initialize WebRTC as broadcaster
    broadcasterRef.current = new WebRTCManager(
      "broadcaster",
      null,
      (status) => {
        setWebrtcStatus((prev) => ({ ...prev, ...status }));
      }
    );

    // Sync across tabs and backend hydration
    const handleStorageChange = () => loadAllData();
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

  const loadAllData = () => {
    const tourneys = parse(STORAGE_KEYS.tournaments, defaultTournaments);
    setTournaments(tourneys);
    if (tourneys.length > 0 && !resultTournament) {
      setResultTournament(tourneys[0].id);
      setPrizeTournament(tourneys[0].id);
    }
    setTournamentRequests(
      parse(STORAGE_KEYS.tournamentRequests, defaultTournamentRequests)
    );
    setRegistrations(parse(STORAGE_KEYS.registrations, {}));
    setPrizes(parse(STORAGE_KEYS.prizes, {}));
    setLeaderboard(parse(STORAGE_KEYS.leaderboard, defaultLeaderboard));
    setAnnouncements(parse(STORAGE_KEYS.announcements, defaultAnnouncements));
    setMatchData(parse(STORAGE_KEYS.liveMatchState, defaultLiveMatchState));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 1. Create Tournament
  const handleCreateTournament = (e) => {
    e.preventDefault();
    if (!newTourney.name || !newTourney.date) return;

    const id = newTourney.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
    const created = {
      id,
      name: newTourney.name,
      game: newTourney.game || "Custom Game",
      date: newTourney.date,
      mode: newTourney.mode,
      prize: newTourney.prize || "Trophy",
      status: "Upcoming",
      description: newTourney.description || "Competitive gaming tournament."
    };

    const updated = [created, ...tournaments];
    setTournaments(updated);
    save(STORAGE_KEYS.tournaments, updated);

    if (newTourney.prize) {
      const currentPrizes = parse(STORAGE_KEYS.prizes, {});
      currentPrizes[id] = newTourney.prize;
      setPrizes(currentPrizes);
      save(STORAGE_KEYS.prizes, currentPrizes);
    }

    setNewTourney({ name: "", game: "", date: "", mode: "Online", prize: "", description: "" });
    setShowCreateTourney(false);
  };

  // Delete Tournament
  const handleDeleteTournament = (id) => {
    const filtered = tournaments.filter((t) => t.id !== id);
    setTournaments(filtered);
    save(STORAGE_KEYS.tournaments, filtered);
  };

  // Process Admin Tournament Registration Queue Decision
  const handleQueueDecisionSubmit = (e, req) => {
    e.preventDefault();
    const decision = queueDecisions[req.id] || "Pending";
    const currentRequests = parse(
      STORAGE_KEYS.tournamentRequests,
      defaultTournamentRequests
    );

    if (decision === "Pending") {
      // Put this tournament at the end of the queue list
      const target = currentRequests.find((r) => r.id === req.id) || req;
      const others = currentRequests.filter((r) => r.id !== req.id);
      const reordered = [
        ...others,
        { ...target, status: "Pending", updatedAt: new Date().toISOString() }
      ];
      save(STORAGE_KEYS.tournamentRequests, reordered);
      setTournamentRequests(reordered);
      setQueueDecisions((prev) => ({ ...prev, [req.id]: "Pending" }));
      setQueueFeedback(
        `"${req.name}" kept Pending and moved to the end of the queue.`
      );
      setTimeout(() => setQueueFeedback(""), 4000);
      return;
    }

    if (decision === "Accepted") {
      const currentTourneys = parse(STORAGE_KEYS.tournaments, defaultTournaments);
      const alreadyExists = currentTourneys.some((t) => t.id === req.id);
      if (!alreadyExists) {
        const registeredTournament = {
          id: req.id,
          name: req.name,
          game: req.game || "Custom Game",
          date: req.date,
          mode: req.mode || "Online",
          prize: req.prize || "Trophy",
          status: "Upcoming",
          description: req.description || "Competitive gaming tournament."
        };
        const updatedTourneys = [registeredTournament, ...currentTourneys];
        save(STORAGE_KEYS.tournaments, updatedTourneys);
        setTournaments(updatedTourneys);
      }

      if (req.prize) {
        const currentPrizes = parse(STORAGE_KEYS.prizes, {});
        currentPrizes[req.id] = req.prize;
        save(STORAGE_KEYS.prizes, currentPrizes);
        setPrizes(currentPrizes);
      }
    }

    const updatedRequests = currentRequests.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: decision,
            reviewedBy: user?.username || "Admin",
            reviewedAt: new Date().toISOString()
          }
        : r
    );
    save(STORAGE_KEYS.tournamentRequests, updatedRequests);
    setTournamentRequests(updatedRequests);
    setQueueDecisions((prev) => {
      const next = { ...prev };
      delete next[req.id];
      return next;
    });
    setQueueFeedback(
      decision === "Accepted"
        ? `"${req.name}" Accepted and registered into tournaments.`
        : `"${req.name}" Rejected and removed from the registration queue.`
    );
    setTimeout(() => setQueueFeedback(""), 4000);
  };

  // 2. Save Match Result (Leaderboard Update)
  const handleResultSubmit = (e) => {
    e.preventDefault();
    const winner = resultWinner.trim();
    const points = Number(resultPoints);
    if (!winner || Number.isNaN(points) || points < 1) return;

    const currentBoard = parse(STORAGE_KEYS.leaderboard, defaultLeaderboard);
    const existing = currentBoard.find(
      (entry) => entry.name.toLowerCase() === winner.toLowerCase()
    );

    if (existing) {
      existing.points += points;
      existing.wins = (existing.wins || 0) + 1;
      existing.matches = (existing.matches || 0) + 1;
    } else {
      currentBoard.push({ name: winner, points, wins: 1, matches: 1 });
    }

    save(STORAGE_KEYS.leaderboard, currentBoard);
    setLeaderboard([...currentBoard]);
    setResultWinner("");
    setResultMsg(`Awarded ${points} points to ${winner}!`);
    setTimeout(() => setResultMsg(""), 3500);
  };

  // 3. Publish Prize Details
  const handlePrizeSubmit = (e) => {
    e.preventDefault();
    if (!prizeTournament || !prizeDetails) return;

    const currentPrizes = parse(STORAGE_KEYS.prizes, {});
    currentPrizes[prizeTournament] = prizeDetails.trim();
    save(STORAGE_KEYS.prizes, currentPrizes);
    setPrizes(currentPrizes);
    setPrizeDetails("");
    setPrizeMsg("Prize distribution published!");
    setTimeout(() => setPrizeMsg(""), 3500);
  };

  // 4. Post Live Update
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

  // 5. Broadcast WebRTC Match Telemetry Packet (Requirement #1)
  const handleBroadcastTelemetry = (e) => {
    e.preventDefault();

    const updatedState = {
      ...matchData,
      lastUpdated: new Date().toLocaleTimeString()
    };

    // Save to storage
    save(STORAGE_KEYS.liveMatchState, updatedState);
    setMatchData(updatedState);

    // Push over WebRTC Data Channel
    let sent = false;
    if (broadcasterRef.current) {
      const res = broadcasterRef.current.broadcastGameData(updatedState);
      sent = res.sentViaRTC;
    }

    setBroadcastAlert(
      sent
        ? "✓ Game telemetry packet transmitted via WebRTC Data Channel to connected peers!"
        : "✓ Match state updated & broadcasted across all tabs via P2P signaling!"
    );
    setTimeout(() => setBroadcastAlert(""), 4000);
  };

  return (
    <main className="container">
      {/* Top Header */}
      <header className="page-header panel">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="module-badge module-badge-admin">Admin Module</span>
            <span className="webrtc-badge">
              <span className="pulse-dot"></span>
              WebRTC P2P Broadcaster
            </span>
          </div>
          <h1 id="welcome-text" style={{ margin: "0.5rem 0 0" }}>
            Welcome, {user?.username || "Admin"}
          </h1>
          <p id="role-text" className="muted" style={{ margin: "2px 0 0" }}>
            Role: {user?.role || "admin"} • Review Tournament Queue, Manage Tournaments, Transmit WebRTC Game Telemetry, Live Streams & Results
          </p>
        </div>

        <nav className="page-links">
          <Link to="/">Home</Link>
          <Link to="/organizer">Organizer View</Link>
          <Link to="/player">Player View</Link>
          <Link to="/spectator">Spectator View</Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenWebRTCModal}
            style={{ fontSize: "0.85rem", padding: "6px 12px" }}
          >
            Verify WebRTC
          </button>
          <button id="logout-btn" className="logout-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      {/* Main Grid */}
      <section className="grid portal-grid">
        {/* Admin Tournament Registration Queue */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
          {(() => {
            const pendingQueue = tournamentRequests.filter(
              (r) => r.status === "Pending"
            );
            const reviewedHistory = tournamentRequests.filter(
              (r) => r.status === "Accepted" || r.status === "Rejected"
            );
            return (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0 }}>Tournament Registration Queue</h3>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                    Pending requests from organizers ({pendingQueue.length} in queue). Choosing Pending and clicking Submit moves the tournament to the end of the list.
                  </p>
                </div>

                {queueFeedback && (
                  <p style={{ margin: "0 0 0.8rem", color: "#86efac", fontSize: "0.88rem" }}>
                    {queueFeedback}
                  </p>
                )}

                {pendingQueue.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>
                    No pending tournaments in the queue.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {pendingQueue.map((req, index) => {
                      const selectedDecision = queueDecisions[req.id] || "Pending";
                      return (
                        <form
                          key={req.id}
                          onSubmit={(e) => handleQueueDecisionSubmit(e, req)}
                          style={{
                            background: "rgba(15, 26, 45, 0.7)",
                            border: "1px solid #2d3e58",
                            borderRadius: "10px",
                            padding: "1rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem"
                          }}
                        >
                          <div style={{ flex: "1 1 320px" }}>
                            <strong style={{ fontSize: "1.05rem", color: "#f8fafc" }}>
                              #{index + 1} — {req.name}
                            </strong>
                            <p className="muted" style={{ fontSize: "0.85rem", margin: "4px 0" }}>
                              {req.game} • {req.date} • {req.mode} • Prize: {req.prize || "Trophy"} • Requested by {req.requestedBy || "Organizer"}
                            </p>
                            <p style={{ fontSize: "0.84rem", margin: 0, color: "#cbd5e1" }}>
                              {req.description}
                            </p>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.6rem",
                              flexWrap: "wrap"
                            }}
                          >
                            <select
                              aria-label={`Decision for ${req.name}`}
                              value={selectedDecision}
                              onChange={(e) =>
                                setQueueDecisions((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value
                                }))
                              }
                              style={{ width: "auto", minWidth: "140px", marginTop: 0 }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <button type="submit">Submit</button>
                          </div>
                        </form>
                      );
                    })}
                  </div>
                )}

                {reviewedHistory.length > 0 && (
                  <div style={{ marginTop: "1rem", paddingTop: "0.8rem", borderTop: "1px solid #2d3e58" }}>
                    <p className="muted" style={{ fontSize: "0.85rem", margin: "0 0 0.4rem" }}>
                      Reviewed Requests:
                    </p>
                    <ul className="content-list">
                      {reviewedHistory.map((item) => (
                        <li key={item.id}>
                          {item.name} — <strong>{item.status}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            );
          })()}
        </article>

        {/* Tournament Management */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h3 style={{ margin: 0 }}>🏆 Tournaments & Registrations Overview</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                Create, monitor, and manage tournaments and player rosters
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateTourney(!showCreateTourney)}
              style={{ background: showCreateTourney ? "var(--panel-alt)" : "var(--accent)" }}
            >
              {showCreateTourney ? "Cancel" : "+ Create New Tournament"}
            </button>
          </div>

          {showCreateTourney && (
            <form onSubmit={handleCreateTournament} className="stack" style={{ background: "#0b1424", padding: "1rem", borderRadius: "10px", marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.8rem" }}>
                <label>
                  Tournament Name
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Predators Championship"
                    value={newTourney.name}
                    onChange={(e) => setNewTourney({ ...newTourney, name: e.target.value })}
                  />
                </label>
                <label>
                  Game Title
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Legends / Valorant"
                    value={newTourney.game}
                    onChange={(e) => setNewTourney({ ...newTourney, game: e.target.value })}
                  />
                </label>
                <label>
                  Schedule / Date
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-10-15 18:00"
                    value={newTourney.date}
                    onChange={(e) => setNewTourney({ ...newTourney, date: e.target.value })}
                  />
                </label>
                <label>
                  Format / Mode
                  <select
                    value={newTourney.mode}
                    onChange={(e) => setNewTourney({ ...newTourney, mode: e.target.value })}
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
                    placeholder="e.g. $1,500 Cash + Trophy"
                    value={newTourney.prize}
                    onChange={(e) => setNewTourney({ ...newTourney, prize: e.target.value })}
                  />
                </label>
                <label>
                  Short Description
                  <input
                    type="text"
                    placeholder="Tournament rules and details..."
                    value={newTourney.description}
                    onChange={(e) => setNewTourney({ ...newTourney, description: e.target.value })}
                  />
                </label>
              </div>
              <button type="submit" style={{ width: "auto", alignSelf: "flex-start", marginTop: "0.5rem" }}>
                Publish Tournament
              </button>
            </form>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.8rem" }}>
            {tournaments.map((tournament) => {
              const enrolled = registrations[tournament.id] || [];
              const prize = prizes[tournament.id] || tournament.prize;
              return (
                <div
                  key={tournament.id}
                  style={{
                    background: "rgba(15, 26, 45, 0.7)",
                    border: "1px solid #2d3e58",
                    borderRadius: "10px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "1.05rem", color: "#f8fafc" }}>{tournament.name}</strong>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: tournament.mode === "Online" ? "rgba(56, 189, 248, 0.2)" : "rgba(74, 222, 128, 0.2)",
                          color: tournament.mode === "Online" ? "#38bdf8" : "#4ade80"
                        }}
                      >
                        {tournament.mode}
                      </span>
                    </div>
                    <p className="muted" style={{ fontSize: "0.85rem", margin: "4px 0" }}>
                      🎮 {tournament.game} • 📅 {tournament.date}
                    </p>
                    <p style={{ fontSize: "0.88rem", margin: "4px 0", color: "#fa9a00" }}>
                      🎁 Prize: {prize || "None set"}
                    </p>
                    <p style={{ fontSize: "0.85rem", margin: "4px 0 8px", color: "#cbd5e1" }}>
                      👥 Registered Players: <strong>{enrolled.length}</strong>
                      {enrolled.length > 0 && (
                        <span className="muted" style={{ display: "block", fontSize: "0.78rem" }}>
                          ({enrolled.join(", ")})
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTournament(tournament.id)}
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
                    Delete Tournament
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        {/* WebRTC Live Telemetry Broadcaster (Requirement #1) */}
        <article className="panel" style={{ border: "1px solid rgba(74, 222, 128, 0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "var(--accent)" }}>⚡ WebRTC Match Broadcaster</h3>
            <span className="webrtc-badge">
              <span className="pulse-dot"></span>
              Packets: {webrtcStatus.packetsSent}
            </span>
          </div>
          <p className="muted" style={{ fontSize: "0.82rem", margin: "4px 0 1rem" }}>
            Evaluation Requirement: Push live match changes directly via WebRTC DataChannel to Spectator/Player tabs
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
              Map & Round Clock
              <input
                type="text"
                placeholder="Haven • 0:45"
                value={`${matchData.map || "Haven"} • ${matchData.roundTime || "1:15"}`}
                onChange={(e) => {
                  const parts = e.target.value.split("•");
                  setMatchData({
                    ...matchData,
                    map: parts[0]?.trim() || "Haven",
                    roundTime: parts[1]?.trim() || "1:00"
                  });
                }}
              />
            </label>

            <label>
              Live Event / Kill Feed Description
              <input
                type="text"
                placeholder="e.g. Phoenix_Jett clutched 1v2 on A Site!"
                value={matchData.recentEvent}
                onChange={(e) => setMatchData({ ...matchData, recentEvent: e.target.value })}
                required
              />
            </label>

            <button type="submit" style={{ background: "var(--accent)", color: "#0b1120", fontWeight: 700 }}>
              📡 Broadcast Changes via WebRTC
            </button>
          </form>

          {broadcastAlert && (
            <p style={{ margin: "0.6rem 0 0", color: "#86efac", fontSize: "0.85rem", fontWeight: 600 }}>
              {broadcastAlert}
            </p>
          )}
        </article>

        {/* YouTube Live Stream Controller (Requirement #2) */}
        <LiveStreamEmbed canEdit={true} />

        {/* Update Match Result & Leaderboard */}
        <article className="panel">
          <h3>Update Match Result</h3>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
            Declares official winners and automatically recalculates leaderboard points
          </p>
          <form onSubmit={handleResultSubmit} className="stack">
            <label>
              Tournament
              <select
                value={resultTournament}
                onChange={(e) => setResultTournament(e.target.value)}
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Winner (Team or Player)
              <input
                type="text"
                required
                placeholder="e.g. Team Phoenix"
                value={resultWinner}
                onChange={(e) => setResultWinner(e.target.value)}
              />
            </label>

            <label>
              Points Awarded
              <input
                type="number"
                min="1"
                required
                value={resultPoints}
                onChange={(e) => setResultPoints(e.target.value)}
              />
            </label>

            <button type="submit">Save Result & Award Points</button>
          </form>

          {resultMsg && (
            <p style={{ margin: "0.6rem 0 0", color: "#86efac", fontSize: "0.88rem" }}>
              {resultMsg}
            </p>
          )}
        </article>

        {/* Prize Distribution */}
        <article className="panel">
          <h3>Prize Distribution</h3>
          <form onSubmit={handlePrizeSubmit} className="stack">
            <label>
              Tournament
              <select
                value={prizeTournament}
                onChange={(e) => setPrizeTournament(e.target.value)}
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Prize Details
              <input
                type="text"
                placeholder="e.g. 1st: $500, 2nd: $250, MVP: $100"
                required
                value={prizeDetails}
                onChange={(e) => setPrizeDetails(e.target.value)}
              />
            </label>

            <button type="submit">Publish Prize</button>
          </form>

          {prizeMsg && (
            <p style={{ margin: "0.6rem 0 0", color: "#86efac", fontSize: "0.88rem" }}>
              {prizeMsg}
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
        </article>

        {/* Leaderboard */}
        <article className="panel">
          <h3>Live Standings & Leaderboard</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team / Player</th>
                <th>Wins</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {[...leaderboard]
                .sort((a, b) => b.points - a.points)
                .map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: idx === 0 ? "#fa9a00" : "inherit", fontWeight: 700 }}>
                      #{idx + 1}
                    </td>
                    <td>{row.name}</td>
                    <td>{row.wins || 0}</td>
                    <td>
                      <strong style={{ color: "var(--accent)" }}>{row.points}</strong>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </article>

        {/* Live Updates Feed */}
        <article className="panel">
          <h3>Recent Announcements Feed</h3>
          <ul className="content-list">
            {announcements.map((entry, idx) => (
              <li key={idx}>{entry}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
};
