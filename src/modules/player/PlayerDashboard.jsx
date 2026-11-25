import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  STORAGE_KEYS,
  parse,
  save,
  defaultTournaments,
  defaultLeaderboard,
  defaultAnnouncements,
  reactionOptions
} from "../../services/storage";
import { WebRTCTelemetryWidget } from "../../components/webrtc/WebRTCTelemetryWidget";
import { LiveStreamEmbed } from "../../components/stream/LiveStreamEmbed";

export const PlayerDashboard = ({ onOpenWebRTCModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [teams, setTeams] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [reactions, setReactions] = useState({});

  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [teamMsg, setTeamMsg] = useState("");
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    loadData();

    const handleStorageChange = () => loadData();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadData = () => {
    setTournaments(parse(STORAGE_KEYS.tournaments, defaultTournaments));
    setRegistrations(parse(STORAGE_KEYS.registrations, {}));
    setTeams(parse(STORAGE_KEYS.teams, []));
    setLeaderboard(parse(STORAGE_KEYS.leaderboard, defaultLeaderboard));
    setAnnouncements(parse(STORAGE_KEYS.announcements, defaultAnnouncements));
    setReactions(
      parse(
        STORAGE_KEYS.reactions,
        Object.fromEntries(reactionOptions.map((e) => [e, 0]))
      )
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Toggle Tournament Registration
  const toggleRegistration = (tournamentId) => {
    if (!user) return;
    const current = parse(STORAGE_KEYS.registrations, {});
    const list = current[tournamentId] || [];

    let updatedList;
    if (list.includes(user.email)) {
      // Unregister
      updatedList = list.filter((email) => email !== user.email);
    } else {
      // Register
      updatedList = [...list, user.email];
    }

    current[tournamentId] = updatedList;
    save(STORAGE_KEYS.registrations, current);
    setRegistrations({ ...current });
  };

  // Create Team
  const handleTeamSubmit = (e) => {
    e.preventDefault();
    const name = teamName.trim();
    const members = teamMembers
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    if (!name || members.length === 0) return;

    const allTeams = parse(STORAGE_KEYS.teams, []);
    allTeams.push({
      owner: user?.email || "anonymous",
      name,
      members: members.includes(user?.username) ? members : [user?.username, ...members]
    });

    save(STORAGE_KEYS.teams, allTeams);
    setTeams(allTeams);
    setTeamName("");
    setTeamMembers("");
    setTeamMsg(`Team "${name}" created successfully!`);
    setTimeout(() => setTeamMsg(""), 3000);
  };

  // React Live
  const handleReaction = (emoji) => {
    const counts = parse(STORAGE_KEYS.reactions, {});
    counts[emoji] = (counts[emoji] || 0) + 1;
    save(STORAGE_KEYS.reactions, counts);
    setReactions({ ...counts });
  };

  const myRegisteredTournaments = tournaments.filter((t) =>
    (registrations[t.id] || []).includes(user?.email)
  );

  const filteredTournaments = tournaments.filter((t) => {
    if (filterMode === "online") return t.mode === "Online";
    if (filterMode === "in-person") return t.mode === "In-person";
    return true;
  });

  const myTeams = teams.filter((t) => t.owner === user?.email);

  return (
    <main className="container">
      {/* Page Header */}
      <header className="page-header panel">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="module-badge module-badge-player">User & Player Module</span>
            <span className="webrtc-badge">
              <span className="pulse-dot"></span>
              Live Telemetry Receiver
            </span>
          </div>
          <h1 id="welcome-text" style={{ margin: "0.5rem 0 0" }}>
            Welcome, {user?.username || "Player"}
          </h1>
          <p id="role-text" className="muted" style={{ margin: "2px 0 0" }}>
            Role: {user?.role || "player"} • Compete in tournaments, form squads, and track live scores
          </p>
        </div>

        <nav className="page-links">
          <Link to="/">Home</Link>
          <Link to="/spectator">Spectator View</Link>
          <Link to="/organizer">Organizer View</Link>
          <Link to="/admin">Admin View</Link>
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
        {/* WebRTC Live Game Telemetry Feed (Requirement #1) */}
        <div style={{ gridColumn: "1 / -1" }}>
          <WebRTCTelemetryWidget onOpenTestModal={onOpenWebRTCModal} />
        </div>

        {/* Tournaments Catalog */}
        <article className="panel" style={{ gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h3 style={{ margin: 0 }}>🎮 Available Tournaments</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.82rem" }}>
                Browse events and register with your squad
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFilterMode("all")}
                style={{ padding: "4px 8px", fontSize: "0.8rem", background: filterMode === "all" ? "var(--panel-alt)" : "transparent" }}
              >
                All
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFilterMode("online")}
                style={{ padding: "4px 8px", fontSize: "0.8rem", background: filterMode === "online" ? "var(--panel-alt)" : "transparent" }}
              >
                Online
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setFilterMode("in-person")}
                style={{ padding: "4px 8px", fontSize: "0.8rem", background: filterMode === "in-person" ? "var(--panel-alt)" : "transparent" }}
              >
                In-Person LAN
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.8rem" }}>
            {filteredTournaments.map((tournament) => {
              const isRegistered = (registrations[tournament.id] || []).includes(user?.email);
              return (
                <div
                  key={tournament.id}
                  className="panel"
                  style={{
                    background: isRegistered ? "rgba(16, 185, 129, 0.08)" : "#0e1829",
                    border: isRegistered ? "1px solid rgba(74, 222, 128, 0.4)" : "1px solid #2d3e58",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "1.05rem" }}>{tournament.name}</strong>
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
                      {tournament.date} • {tournament.game}
                    </p>
                    <p style={{ fontSize: "0.82rem", margin: "4px 0", color: "#fa9a00" }}>
                      Prize Pool: {tournament.prize || "$300"}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "6px 0 10px" }}>
                      {tournament.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRegistration(tournament.id)}
                    style={{
                      background: isRegistered ? "rgba(239, 68, 68, 0.15)" : "var(--accent)",
                      color: isRegistered ? "#fca5a5" : "#0b1120",
                      borderColor: isRegistered ? "rgba(239, 68, 68, 0.4)" : "var(--accent)"
                    }}
                  >
                    {isRegistered ? "✓ Registered (Click to Leave)" : "+ Register for Tournament"}
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        {/* My Registrations & Schedule */}
        <article className="panel">
          <h3>📅 My Schedule & Registrations</h3>
          {myRegisteredTournaments.length === 0 ? (
            <p className="muted" style={{ fontSize: "0.9rem" }}>
              You haven't registered for any tournaments yet. Join one from the catalog!
            </p>
          ) : (
            <ul className="content-list">
              {myRegisteredTournaments.map((t) => (
                <li key={t.id} style={{ marginBottom: "0.8rem" }}>
                  <strong>{t.name}</strong>
                  <div className="muted" style={{ fontSize: "0.82rem" }}>
                    {t.date} • {t.mode}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        {/* Team Manager */}
        <article className="panel">
          <h3>🛡️ Create Squad / Team</h3>
          <form onSubmit={handleTeamSubmit} className="stack">
            <label>
              Team Name
              <input
                type="text"
                placeholder="e.g. Phoenix Rising"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </label>
            <label>
              Members (comma separated)
              <input
                type="text"
                placeholder="Alex, Sam, Lee, Jordan"
                required
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
              />
            </label>
            <button type="submit">Create Team</button>
          </form>

          {teamMsg && (
            <p style={{ margin: "0.5rem 0 0", color: "#86efac", fontSize: "0.85rem" }}>
              {teamMsg}
            </p>
          )}

          <div style={{ marginTop: "1rem", borderTop: "1px solid #2d3e58", paddingTop: "0.8rem" }}>
            <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>My Squads:</h4>
            {myTeams.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.85rem" }}>No teams created yet.</p>
            ) : (
              <ul className="content-list" style={{ fontSize: "0.88rem" }}>
                {myTeams.map((t, idx) => (
                  <li key={idx}>
                    <strong>{t.name}</strong>: {t.members.join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        {/* Spectator Reactions */}
        <article className="panel">
          <h3>🎉 Live Reactions</h3>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
            Cheer for teams competing on the main stage
          </p>
          <div className="reaction-box">
            {reactionOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReaction(emoji)}
                title={`React with ${emoji}`}
              >
                {emoji} {reactions[emoji] || 0}
              </button>
            ))}
          </div>
        </article>

        {/* Live Standings */}
        <article className="panel">
          <h3>Leaderboard Standings</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {[...leaderboard]
                .sort((a, b) => b.points - a.points)
                .slice(0, 5)
                .map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ color: idx === 0 ? "#fa9a00" : "inherit", fontWeight: 700 }}>
                      #{idx + 1}
                    </td>
                    <td>{row.name}</td>
                    <td>
                      <strong style={{ color: "var(--accent)" }}>{row.points}</strong>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </article>

        {/* Live Announcements */}
        <article className="panel">
          <h3>📢 Live Updates</h3>
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
