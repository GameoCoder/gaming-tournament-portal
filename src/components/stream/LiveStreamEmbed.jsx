import React, { useState, useEffect } from "react";
import { STORAGE_KEYS, parse, save, defaultStreamConfig } from "../../services/storage";
import { InfoTip } from "../common/InfoDialog";

export const LiveStreamEmbed = ({ canEdit = false }) => {
  const [streamConfig, setStreamConfig] = useState(defaultStreamConfig);
  const [customInput, setCustomInput] = useState("");
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    const loaded = parse(STORAGE_KEYS.streamConfig, defaultStreamConfig);
    setStreamConfig(loaded);

    // Sync if changed across tabs
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.streamConfig) {
        setStreamConfig(parse(STORAGE_KEYS.streamConfig, defaultStreamConfig));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Helper to extract YouTube video ID from various URL formats or plain ID
  const extractVideoId = (input) => {
    if (!input) return "";
    const trimmed = input.trim();
    // Plain 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    // Standard watch URL: youtube.com/watch?v=ID
    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];

    // Shortened youtu.be/ID
    const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // Live URL: youtube.com/live/ID
    const liveMatch = trimmed.match(/(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];

    // Embed URL: youtube.com/embed/ID
    const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    return trimmed;
  };

  const switchPreset = (videoId, title) => {
    const updated = { ...streamConfig, activeId: videoId, title: title || streamConfig.title };
    setStreamConfig(updated);
    save(STORAGE_KEYS.streamConfig, updated);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const id = extractVideoId(customInput);
    if (!id) {
      setEditStatus("Please enter a valid YouTube video ID or link.");
      return;
    }
    const updated = {
      ...streamConfig,
      activeId: id,
      title: "Custom Match Live Stream"
    };
    setStreamConfig(updated);
    save(STORAGE_KEYS.streamConfig, updated);
    setCustomInput("");
    setEditStatus("Stream source updated successfully!");
    setTimeout(() => setEditStatus(""), 3000);
  };

  const currentId = streamConfig?.activeId || "VZig-3ABCjw";
  const embedUrl = `https://www.youtube-nocookie.com/embed/${currentId}?autoplay=0&rel=0&modestbranding=1`;

  return (
    <article className="panel" style={{ padding: "1.2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div className="heading-with-info">
          <h3 style={{ margin: 0 }}>📺 Live Tournament Stream</h3>
          <span
            style={{
              background: "rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "0.75rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }}></span>
            LIVE
          </span>
          <InfoTip title="Live Stream Broadcast" badge="YouTube Embed">
            <p>
              <strong>Active Broadcast:</strong> {streamConfig.title || "Main Tournament Broadcast"}
            </p>
            <p>
              Switch between preset tournament channels below the player.{" "}
              {canEdit
                ? "As an Organizer/Admin, you can paste any YouTube URL (watch, live, share, or 11-char ID) to update the stream for everyone."
                : "Organizers and Admins can update the active stream feed in real time."}
            </p>
          </InfoTip>
        </div>
        <span className="muted" style={{ fontSize: "0.85rem" }}>
          {streamConfig.title || "Main Tournament Broadcast"}
        </span>
      </div>

      <div className="stream-container">
        <iframe
          src={embedUrl}
          title="Gaming Tournament Live Stream"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>

      {/* Preset Stream Switcher */}
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span className="muted" style={{ fontSize: "0.85rem" }}>Channels:</span>
        {streamConfig.presets?.map((preset) => (
          <button
            key={preset.videoId}
            type="button"
            onClick={() => switchPreset(preset.videoId, preset.name)}
            className="btn-secondary"
            style={{
              padding: "4px 10px",
              fontSize: "0.8rem",
              borderRadius: "6px",
              background: currentId === preset.videoId ? "rgba(56, 189, 248, 0.25)" : "transparent",
              borderColor: currentId === preset.videoId ? "var(--accent-2)" : "var(--panel-alt)"
            }}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Admin Stream Controller */}
      {canEdit && (
        <div style={{ marginTop: "1rem", paddingTop: "0.8rem", borderTop: "1px solid #2d3c52" }}>
          <form onSubmit={handleCustomSubmit} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Paste custom YouTube stream URL or Video ID..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              style={{ flex: "1 1 200px", minWidth: 0, marginTop: 0 }}
            />
            <button type="submit" style={{ whiteSpace: "nowrap" }}>
              Update Stream
            </button>
          </form>
          {editStatus && (
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem", color: editStatus.includes("success") ? "#86efac" : "#fca5a5" }}>
              {editStatus}
            </p>
          )}
        </div>
      )}
    </article>
  );
};
