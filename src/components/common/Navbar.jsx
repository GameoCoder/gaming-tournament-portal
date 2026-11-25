import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Navbar = ({ onOpenWebRTCModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  const handleOpenWebRTC = () => {
    closeMenu();
    if (onOpenWebRTCModal) onOpenWebRTCModal();
  };

  const getRoleBadgeClass = (role) => {
    if (role === "organizer" || role === "admin") return "module-badge-admin";
    if (role === "player") return "module-badge-player";
    return "module-badge-spectator";
  };

  return (
    <header className="hero-header">
      <nav className="navbar-nav" aria-label="Main navigation">
        <div className="components">
          <div className="nav-top-bar">
            <Link to="/" className="brand" onClick={closeMenu}>
              Gaming Tournament Portal
            </Link>
            <button
              type="button"
              className="nav-toggle-btn"
              aria-expanded={isMenuOpen}
              aria-controls="primary-nav-menu"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <span aria-hidden="true">{isMenuOpen ? "✕" : "☰"}</span>
              <span className="nav-toggle-label">{isMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </div>

          <div
            id="primary-nav-menu"
            className={`nav-collapse ${isMenuOpen ? "open" : ""}`}
          >
            <div className="nav-group-left">
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "router-active" : "")}
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "router-active" : "")}
              >
                About
              </NavLink>
              <NavLink
                to="/spectator"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "router-active" : "")}
              >
                Spectator
              </NavLink>
              <NavLink
                to="/player"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "router-active" : "")}
              >
                Player
              </NavLink>
              <NavLink
                to="/organizer"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "router-active" : "")}
              >
                Organizer
              </NavLink>
              <NavLink
                to="/admin"
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "router-active" : "")}
              >
                Admin
              </NavLink>
            </div>

            <div className="nav-group-right">
              {onOpenWebRTCModal && (
                <button
                  type="button"
                  className="nav-link-btn webrtc-btn"
                  onClick={handleOpenWebRTC}
                  title="Test WebRTC P2P Data Channel"
                >
                  WebRTC Diagnostics
                </button>
              )}

              {user ? (
                <div className="nav-user-group">
                  <span
                    className={`module-badge ${getRoleBadgeClass(user.role)}`}
                    title={`Logged in as ${user.email}`}
                  >
                    {user.role} • {user.username}
                  </span>
                  <button
                    type="button"
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="nav-auth-group">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className={({ isActive }) => (isActive ? "router-active" : "")}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={closeMenu}
                    className={({ isActive }) => (isActive ? "router-active" : "")}
                  >
                    Signup
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
