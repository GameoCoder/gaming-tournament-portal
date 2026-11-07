import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <section className="hero-content">
        <p className="tag">Online & In-Person eSports Events</p>
        <h1>Gaming Tournament Portal</h1>
        <p className="sub">
          Register for tournaments, build teams, follow schedules, and stay updated with live results.
          Powered by React, Vite, and WebRTC for real-time peer-to-peer match telemetry.
        </p>

        <div className="hero-actions">
          {user ? (
            <Link
              className="btn"
              to={
                user.role === "organizer" || user.role === "admin"
                  ? "/admin"
                  : user.role === "player"
                  ? "/player"
                  : "/spectator"
              }
            >
              Open Your {user.role?.toUpperCase()} Dashboard →
            </Link>
          ) : (
            <>
              <Link className="btn" to="/signup">
                Start as New Player
              </Link>
              <Link className="btn btn-secondary" to="/login">
                Already have an account?
              </Link>
            </>
          )}
          <Link className="btn btn-secondary" to="/spectator">
            Watch Live Stream
          </Link>
        </div>
      </section>

      {/* 3D Interactive Flip Cards matching original index.html */}
      <main className="container grid three-col">
        <div className="card-1">
          <img src="/assets/images/panel-1.jpg" alt="For Players" />
          <Link to="/player">
            <div className="card__content-1">
              <p className="card__title-1">For Players</p>
              <p className="card__description-1">
                Join events, track your schedule, and create teams with your friends.
              </p>
            </div>
          </Link>
        </div>

        <div className="card-1">
          <img src="/assets/images/panel-2.webp" alt="For Organizers" />
          <Link to="/admin">
            <div className="card__content-1">
              <p className="card__title-1">For Organizers</p>
              <p className="card__description-1">
                Manage registrations, publish announcements, and update leaderboards.
              </p>
            </div>
          </Link>
        </div>

        <div className="card-1">
          <img src="/assets/images/panel-3.jpg" alt="For Spectators" />
          <Link to="/spectator">
            <div className="card__content-1">
              <p className="card__title-1">For Spectators</p>
              <p className="card__description-1">
                Watch updates live, tune into YouTube streams, and react to your favourite teams!
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};
