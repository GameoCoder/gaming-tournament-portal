import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "5rem" }}>
        <p className="muted">Loading user session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    const hasRole = allowedRoles.some((r) => r.toLowerCase() === userRole);
    if (!hasRole) {
      const target =
        userRole === "organizer" || userRole === "admin"
          ? "/admin"
          : userRole === "player"
          ? "/player"
          : "/spectator";
      return <Navigate to={target} replace />;
    }
  }

  return children;
};
