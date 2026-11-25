import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { InfoTip } from "../../components/common/InfoDialog";

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("player");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const result = await signup({ username, email, password, role });
    setSubmitting(false);

    if (!result.success) {
      setIsError(true);
      setMessage(result.message);
      return;
    }

    setIsError(false);
    setMessage("Account created successfully! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 900);
  };

  return (
    <main className="container auth-container">
      <header className="page-header">
        <div className="heading-with-info">
          <h1 style={{ margin: 0 }}>Signup</h1>
          <InfoTip title="Choosing Your Portal Role" badge="Registration" size="md">
            <p>Create an account and pick the role that matches how you use the portal:</p>
            <div className="info-dialog-meta">
              <div><strong>Player:</strong> Join tournaments &amp; manage teams</div>
              <div><strong>Organizer:</strong> Submit event requests &amp; broadcast telemetry</div>
              <div><strong>Admin:</strong> Review queue requests &amp; publish standings</div>
              <div><strong>Spectator:</strong> Watch live matches &amp; cheer teams</div>
            </div>
          </InfoTip>
        </div>
        <nav className="page-links">
          <Link to="/">Home</Link>
          <Link to="/login">Already registered?</Link>
        </nav>
      </header>

      <section className="panel" style={{ maxWidth: "520px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Username
            <input
              type="text"
              id="signup-username"
              placeholder="e.g. candy1912"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              id="signup-email"
              placeholder="e.g. candy1912@mail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              id="signup-password"
              minLength={6}
              placeholder="Minimum 6 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label>
            Role
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="player">Player (Compete & Join Teams)</option>
              <option value="organizer">Organizer (Request & Host Tournaments)</option>
              <option value="admin">Admin (Approve Queue & Manage Portal)</option>
              <option value="spectator">Spectator (Watch & React)</option>
            </select>
          </label>

          <button type="submit" disabled={submitting} style={{ marginTop: "0.5rem" }}>
            {submitting ? "Creating Account..." : "Create Account"}
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
      </section>
    </main>
  );
};
