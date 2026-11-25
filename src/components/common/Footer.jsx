import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="portal-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-brand">Gaming Tournament Portal</span>
          <span className="footer-meta">© 2026. All rights reserved.</span>
        </div>

        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/spectator">Spectator</Link>
          <Link to="/player">Player</Link>
          <Link to="/organizer">Organizer</Link>
          <Link to="/admin">Admin</Link>
          <a
            href="https://github.com/GameoCoder/Gaming-Tournament-Portal"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
};
