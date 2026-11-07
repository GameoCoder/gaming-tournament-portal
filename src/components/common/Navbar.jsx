import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Navbar = ({ onOpenWebRTCModal }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadgeClass = (role) => {
    if (role === "organizer" || role === "admin") return "module-badge-admin";
    if (role === "player") return "module-badge-player";
    return "module-badge-spectator";
  };

  return (
    <header className="hero-header">
      <nav className="navbar-nav">
        <div className="components">
          <div className="nav-group-left">
            <Link to="/" className="brand">
              Gaming Tournament Portal
            </Link>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "router-active" : "")}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "router-active" : "")}
            >
              About
            </NavLink>
            <NavLink
              to="/spectator"
              className={({ isActive }) => (isActive ? "router-active" : "")}
            >
              Spectator
            </NavLink>
            <NavLink
              to="/player"
              className={({ isActive }) => (isActive ? "router-active" : "")}
            >
              Player
            </NavLink>
            <NavLink
              to="/admin"
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
                onClick={onOpenWebRTCModal}
                title="Test WebRTC P2P Data Channel"
              >
                WebRTC Diagnostics
              </button>
            )}

            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <NavLink
                  to="/login"
                  className={({ isActive }) => (isActive ? "router-active" : "")}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => (isActive ? "router-active" : "")}
                >
                  Signup
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
