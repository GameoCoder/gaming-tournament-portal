import React, { useState, useEffect, useRef } from "react";
import { WebRTCManager } from "../../services/webrtc";
import { STORAGE_KEYS, parse, save, defaultLiveMatchState } from "../../services/storage";

export const WebRTCTelemetryWidget = ({ onOpenTestModal }) => {
  const [matchState, setMatchState] = useState(defaultLiveMatchState);
  const [webrtcStatus, setWebrtcStatus] = useState({
    isConnected: false,
    channelState: "connecting",
    packetsReceived: 0,
    role: "receiver"
  });

  const webrtcRef = useRef(null);

  useEffect(() => {
    // Initial load from storage
    const loaded = parse(STORAGE_KEYS.liveMatchState, defaultLiveMatchState);
    setMatchState(loaded);

    // Initialize WebRTC receiver
    webrtcRef.current = new WebRTCManager(
      "receiver",
      (incomingData) => {
        // Direct WebRTC packet received!
        setMatchState((prev) => ({
          ...prev,
          ...incomingData,
          lastUpdated: new Date().toLocaleTimeString(),
          transmittedVia: "WebRTC RTCDataChannel (P2P)"
        }));
      },
      (status) => {
        setWebrtcStatus((prev) => ({ ...prev, ...status }));
      }
    );

    // Also listen to storage events for cross-tab sync
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEYS.liveMatchState) {
        const update = parse(STORAGE_KEYS.liveMatchState, defaultLiveMatchState);
        setMatchState(update);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (webrtcRef.current) {
        webrtcRef.current.destroy();
      }
    };
  }, []);

  return (
    <article className="panel" style={{ position: "relative", overflow: "hidden" }}>
      {/* Top Banner with WebRTC status badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>⚡ WebRTC Live Game Telemetry</span>
          </h3>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.82rem" }}>
            Real-time peer-to-peer match feed transmitted via RTCDataChannel
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            className="webrtc-badge"
            title={`WebRTC Data Channel: ${webrtcStatus.channelState}`}
          >
            <span className="pulse-dot"></span>
            <span>WebRTC P2P: {webrtcStatus.isConnected ? "Connected" : "Listening (P2P)"}</span>
          </span>

          {onOpenTestModal && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onOpenTestModal}
              style={{ padding: "4px 10px", fontSize: "0.78rem" }}
            >
              Verify P2P
            </button>
          )}
        </div>
      </div>

      {/* Scoreboard Display */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(24, 35, 55, 0.9), rgba(15, 23, 42, 0.95))",
          borderRadius: "10px",
          border: "1px solid #334460",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #23334c", paddingBottom: "0.5rem" }}>
          <span style={{ fontWeight: 700, color: "var(--accent-2)" }}>{matchState.tournamentId.toUpperCase()}</span>
          <span style={{ fontSize: "0.85rem", color: "#facc15", background: "rgba(250, 204, 21, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
            Map: {matchState.map || "Haven"} • Round {matchState.round || 1} ({matchState.roundTime || "0:00"})
          </span>
        </div>

        {/* Teams and Scores */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0.5rem 0" }}>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0" }}>{matchState.teamA}</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#4ade80", lineHeight: 1.1 }}>{matchState.scoreA}</div>
          </div>

          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--muted)", padding: "0 1rem" }}>
            VS
          </div>

          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0" }}>{matchState.teamB}</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#38bdf8", lineHeight: 1.1 }}>{matchState.scoreB}</div>
          </div>
        </div>

        {/* Live Event Ticker */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "6px",
            padding: "0.5rem 0.75rem",
            fontSize: "0.88rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.4rem"
          }}
        >
          <span style={{ color: "#cbd5e1" }}>
            <strong style={{ color: "#fa9a00" }}>Live Event:</strong> {matchState.recentEvent || "Match in progress"}
          </span>
          <span className="muted" style={{ fontSize: "0.78rem" }}>
            {matchState.transmittedVia ? "⚡ " + matchState.transmittedVia : "Updated " + matchState.lastUpdated}
          </span>
        </div>
      </div>
    </article>
  );
};
