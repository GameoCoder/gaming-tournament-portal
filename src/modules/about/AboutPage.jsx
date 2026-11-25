import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ValorantCard } from "./ValorantCard";
import "./ValorantTeam.css";

const STORAGE_KEY = "gtp_team_roster";

const DEFAULT_MEMBERS = [
  {
    id: 1,
    name: "Nitin Singh",
    codename: "PHOENIX",
    role: "Video Embed & WebRTC",
    rank: "RADIANT",
    themeColor: "#ff4655",
    glowColor: "rgba(255, 70, 85, 0.4)",
    image: "/assets/images/cards/member-1.png",
    overview:
      "",
    detailedIntel:
      "",
    tags: ["React 18", "WebRTC P2P", "Vite", "Architecture"],
    github: "https://github.com/GameoCoder",
    linkedin: "https://www.linkedin.com/in/nitin-singh-024512377",
  },
  {
    id: 2,
    name: "Ayushman Aryan",
    codename: "JETT",
    role: "Ideation & System Design",
    rank: "IMMORTAL",
    themeColor: "#00f5d4",
    glowColor: "rgba(0, 245, 212, 0.35)",
    image: "/assets/images/cards/member-2.png",
    overview:
      "",
    detailedIntel:
      "",
    tags: ["State Logic", "Persistence", "Tournaments", "Data Flow"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: 3,
    name: "Bhoopendra Singh",
    codename: "OMEN",
    role: "UI/UX & Frontend",
    rank: "RADIANT",
    themeColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.35)",
    image: "/assets/images/cards/member-3.png",
    overview:
      "",
    detailedIntel:
      "",
    tags: ["CSS Systems", "Responsive Layout", "Design System", "Components"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
];

export const AboutPage = () => {
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
    } catch {
      return DEFAULT_MEMBERS;
    }
  });

  const [activeIntelMember, setActiveIntelMember] = useState(null);
  const [isEditingRoster, setIsEditingRoster] = useState(false);
  const [editFormData, setEditFormData] = useState([]);

  const handleOpenEditModal = () => {
    setEditFormData(JSON.parse(JSON.stringify(members)));
    setIsEditingRoster(true);
  };

  const handleSaveRoster = (e) => {
    e.preventDefault();
    setMembers(editFormData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editFormData));
    } catch (err) {
      console.error("Failed to save roster", err);
    }
    setIsEditingRoster(false);
  };

  const handleResetRoster = () => {
    if (window.confirm("Reset all 3 cards to defaults?")) {
      setMembers(DEFAULT_MEMBERS);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.error(err);
      }
      setIsEditingRoster(false);
    }
  };

  const updateEditMember = (index, field, value) => {
    setEditFormData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <main className="valorant-showcase-container">
      {/* Clean Header */}
      <header className="valorant-header">
        <div>
          <h1 className="valorant-title">Core Development Team</h1>
          <p className="valorant-subtitle">
            Meet the 3 engineers behind the Gaming Tournament Portal.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="tactical-btn"
            onClick={handleOpenEditModal}
          >
            Edit Team Info
          </button>
        </div>
      </header>

      {/* 3 Valorant Cards Grid — pure hover zoom without pitch/yaw/roll */}
      <section className="valorant-cards-grid">
        {members.map((member) => (
          <ValorantCard
            key={member.id}
            member={member}
            onOpenIntel={(m) => setActiveIntelMember(m)}
            onEdit={handleOpenEditModal}
          />
        ))}
      </section>

      {/* Member Details Modal */}
      {activeIntelMember && (
        <div
          className="valorant-modal-backdrop"
          onClick={() => setActiveIntelMember(null)}
        >
          <div
            className="valorant-modal"
            style={{
              borderLeft: `3px solid ${activeIntelMember.themeColor || "#ff4655"}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="valorant-modal-close"
              onClick={() => setActiveIntelMember(null)}
            >
              ✕
            </button>

            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              <div
                className="valorant-modal-portrait"
                style={{
                  borderRadius: "6px",
                  overflow: "hidden",
                  border: `1px solid rgba(255, 255, 255, 0.15)`,
                  flexShrink: 0,
                }}
              >
                <img
                  src={activeIntelMember.image}
                  alt={activeIntelMember.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ flex: "1 1 min(260px, 100%)", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: activeIntelMember.themeColor,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  {activeIntelMember.codename} • {activeIntelMember.rank}
                </span>

                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    margin: "0.2rem 0",
                    color: "#fff",
                  }}
                >
                  {activeIntelMember.name}
                </h2>

                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#94a3b8",
                    margin: "0 0 1rem",
                  }}
                >
                  Role: {activeIntelMember.role}
                </p>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    padding: "0.9rem",
                    borderRadius: "6px",
                    borderLeft: `2px solid ${activeIntelMember.themeColor}`,
                    marginBottom: "1rem",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                      color: "#cbd5e1",
                    }}
                  >
                    {activeIntelMember.detailedIntel || activeIntelMember.overview}
                  </p>
                </div>

                {activeIntelMember.tags && (
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {activeIntelMember.tags.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          padding: "3px 8px",
                          fontSize: "0.75rem",
                          borderRadius: "4px",
                          color: "#e2e8f0",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roster Customizer Modal */}
      {isEditingRoster && (
        <div
          className="valorant-modal-backdrop"
          onClick={() => setIsEditingRoster(false)}
        >
          <div
            className="valorant-modal"
            style={{ maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="valorant-modal-close"
              onClick={() => setIsEditingRoster(false)}
            >
              ✕
            </button>

            <h2 style={{ fontSize: "1.4rem", margin: "0 0 0.5rem", color: "#fff" }}>
              Edit Team Members
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                marginTop: 0,
                marginBottom: "1.2rem",
              }}
            >
              Update your team members' names, photos, roles, and project summaries.
            </p>

            <form onSubmit={handleSaveRoster} className="roster-edit-form">
              {editFormData.map((item, idx) => (
                <div key={item.id} className="roster-card-editor">
                  <div className="roster-card-editor-title">
                    <span>Member #{item.id}</span>
                    <span style={{ fontSize: "0.8rem", color: item.themeColor }}>
                      {item.role}
                    </span>
                  </div>

                  <div className="roster-input-row">
                    <div className="roster-input-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateEditMember(idx, "name", e.target.value)}
                        required
                      />
                    </div>

                    <div className="roster-input-group">
                      <label>Role</label>
                      <input
                        type="text"
                        value={item.role}
                        onChange={(e) => updateEditMember(idx, "role", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="roster-input-row">
                    <div className="roster-input-group">
                      <label>9:16 Photo Path / URL</label>
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) => updateEditMember(idx, "image", e.target.value)}
                        required
                      />
                    </div>

                    <div className="roster-input-group">
                      <label>Agent Codename</label>
                      <input
                        type="text"
                        value={item.codename}
                        onChange={(e) => updateEditMember(idx, "codename", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="roster-input-group">
                    <label>Overview (Project Contribution / Lorem Ipsum)</label>
                    <textarea
                      rows="2"
                      value={item.overview}
                      onChange={(e) => updateEditMember(idx, "overview", e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1rem",
                  flexWrap: "wrap",
                  gap: "0.8rem",
                }}
              >
                <button
                  type="button"
                  onClick={handleResetRoster}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(248, 113, 113, 0.4)",
                    color: "#f87171",
                    padding: "6px 14px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Reset Defaults
                </button>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingRoster(false)}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "none",
                      color: "#cbd5e1",
                      padding: "6px 14px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="tactical-btn"
                    style={{
                      background: "#38bdf8",
                      borderColor: "#38bdf8",
                      color: "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default AboutPage;
