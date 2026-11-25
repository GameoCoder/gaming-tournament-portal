import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { InfoTip } from "../../components/common/InfoDialog";

export const LoginPage = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const redirectByRole = (role) => {
    if (role === "admin") navigate("/admin");
    else if (role === "organizer") navigate("/organizer");
    else if (role === "player") navigate("/player");
    else navigate("/spectator");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const result = await login(identifier, password);
    setSubmitting(false);

    if (!result.success) {
      setIsError(true);
      setMessage(result.message || "Invalid username/email or password.");
      return;
    }

    setIsError(false);
    setMessage("Login successful. Redirecting...");
    setTimeout(() => {
      redirectByRole(result.user.role);
    }, 500);
  };

  const handleQuickDemo = async (role) => {
    setMessage(`Logging in as ${role}...`);
    setIsError(false);
    const result = await quickLogin(role);
    if (result.success) {
      redirectByRole(result.user.role);
    } else {
      setIsError(true);
      setMessage(result.message);
    }
  };

  return (
    <main className="container auth-container">
      <header className="page-header">
        <div className="heading-with-info">
          <h1 style={{ margin: 0 }}>Login</h1>
          <InfoTip title="Portal Access & Demo Roles" badge="Authentication" size="md">
            <p>Sign in with your username or email to open your role dashboard.</p>
            <div className="info-dialog-meta">
              <div><strong>Admin:</strong> Approve tournament queues, results &amp; prizes</div>
              <div><strong>Organizer:</strong> Request events &amp; broadcast match telemetry</div>
              <div><strong>Player:</strong> Register for tournaments &amp; build squads</div>
              <div><strong>Spectator:</strong> Watch live streams &amp; send reactions</div>
            </div>
          </InfoTip>
        </div>
        <nav className="page-links">
          <Link to="/">Home</Link>
          <Link to="/signup">Create account</Link>
        </nav>
      </header>

      <section className="panel" style={{ maxWidth: "440px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Username or Email
            <input
              type="text"
              id="login-email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. player, candy1912, or player@gtp.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              id="login-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button type="submit" disabled={submitting} style={{ marginTop: "0.5rem" }}>
            {submitting ? "Authenticating..." : "Login"}
          </button>
        </form>

        {message && (
          <p
            id="auth-message"
            className="message"
            style={{ color: isError ? "#fca5a5" : "#86efac", fontWeight: 500 }}
          >
            {message}
          </p>
        )}

        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p className="muted" style={{ margin: "0 0 0.5rem", fontSize: "0.85rem" }}>
            Quick Demo Accounts:
          </p>
          <div className="demo-role-buttons">
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemo("admin")}
              title="admin / admin123"
            >
              Admin
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemo("organizer")}
              title="organizer / organizer123"
            >
              Organizer
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemo("player")}
              title="player / player123"
            >
              Player
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => handleQuickDemo("spectator")}
              title="spectator / spectator123"
            >
              Spectator
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
