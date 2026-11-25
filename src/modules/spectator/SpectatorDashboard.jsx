import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  STORAGE_KEYS,
  parse,
  save,
  defaultLeaderboard,
  defaultAnnouncements,
  reactionOptions
} from "../../services/storage";
import { LiveStreamEmbed } from "../../components/stream/LiveStreamEmbed";
import { WebRTCTelemetryWidget } from "../../components/webrtc/WebRTCTelemetryWidget";

export const SpectatorDashboard = ({ onOpenWebRTCModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [reactions, setReactions] = useState({});
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  useEffect(() => {
    loadData();

    const handleStorageChange = () => loadData();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadData = () => {
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

  const handleReaction = (emoji) => {
    const counts = parse(STORAGE_KEYS.reactions, {});
    counts[emoji] = (counts[emoji] || 0) + 1;
    save(STORAGE_KEYS.reactions, counts);
    setReactions({ ...counts });

    // Floating reaction animation
    const id = Date.now() + Math.random();
    const x = Math.floor(Math.random() * 80) + 10;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  };

  return (
    <main className="container" style={{ position: "relative" }}>
      {/* Floating Emojis Animation Container */}
      <div
        style={{
          position: "fixed",
          bottom: "40px",
          left: "0",
          right: "0",
          pointerEvents: "none",
          height: "300px",
          zIndex: 1500,
          overflow: "hidden"
        }}
      >
        {floatingEmojis.map((item) => (
          <span
            key={item.id}
            style={{
              position: "absolute",
              bottom: "0",
              left: `${item.x}%`,
              fontSize: "2.2rem",
              animation: "floatUp 1.8s ease-out forwards"
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          50% { transform: translateY(-120px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(-240px) scale(1.6); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <header className="page-header panel">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="module-badge module-badge-spectator">Spectator & Broadcast Module</span>
            <span className="webrtc-badge">
              <span className="pulse-dot"></span>
              Live Telemetry Stream
            </span>
          </div>
          <h1 id="welcome-text" style={{ margin: "0.5rem 0 0" }}>
            {user ? `Welcome, ${user.username}` : "Spectator Arena"}
          </h1>
          <p id="role-text" className="muted" style={{ margin: "2px 0 0" }}>
            Watch official esports live streams, track real-time WebRTC match scores, and react live
          </p>
        </div>

        <nav className="page-links">
          <Link to="/">Home</Link>
          <Link to="/player">Player View</Link>
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
          {user && (
            <button id="logout-btn" className="logout-btn" type="button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </header>

      {/* Main Grid */}
      <section className="grid portal-grid">
        {/* Requirement #2: YouTube Live Stream Embed */}
        <div style={{ gridColumn: "1 / -1" }}>
          <LiveStreamEmbed canEdit={user?.role === "organizer" || user?.role === "admin"} />
        </div>

        {/* Requirement #1: WebRTC Live Game Telemetry Feed */}
        <div style={{ gridColumn: "1 / -1" }}>
          <WebRTCTelemetryWidget onOpenTestModal={onOpenWebRTCModal} />
        </div>

        {/* Live Reaction Box */}
        <article className="panel">
          <h3>🎉 React Live</h3>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
            Send live cheers and reactions to teams currently competing!
          </p>
          <div className="reaction-box">
            {reactionOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleReaction(emoji)}
                title={`Cheer with ${emoji}`}
              >
                {emoji} {reactions[emoji] || 0}
              </button>
            ))}
          </div>
        </article>

        {/* Leaderboard */}
        <article className="panel">
          <h3>🏆 Tournament Leaderboard</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Matches</th>
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
                    <td>{row.matches || 0}</td>
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
          <h3>📢 Live Updates Feed</h3>
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
