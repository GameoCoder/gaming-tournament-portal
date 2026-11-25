import React, { createContext, useContext, useState, useEffect } from "react";
import {
  STORAGE_KEYS,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  hashPassword,
  parse,
  save,
  ensureDefaults
} from "../services/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureDefaults();
    const syncSession = () => {
      const active = getCurrentUser();
      if (active && active.email?.toLowerCase() === "admin@gtp.com" && active.role !== "admin") {
        active.role = "admin";
        setCurrentUser(active);
      }
      setUser(active || null);
    };

    syncSession();
    setLoading(false);

    window.addEventListener("gtp-db-synced", syncSession);
    return () => window.removeEventListener("gtp-db-synced", syncSession);
  }, []);

  const login = async (identifier, password) => {
    try {
      const trimmed = (identifier || "").trim().toLowerCase();
      const passwordHash = await hashPassword(password);
      const users = parse(STORAGE_KEYS.users, []);

      // Support login by email OR username (including role aliases: player, spectator, organizer, admin)
      const found = users.find(
        (u) =>
          (u.email.toLowerCase() === trimmed ||
            u.username.toLowerCase() === trimmed ||
            (trimmed === "player" && u.email === "player@gtp.com") ||
            (trimmed === "spectator" && u.email === "spectator@gtp.com") ||
            (trimmed === "organizer" && u.email === "organizer@gtp.com") ||
            (trimmed === "admin" && u.email === "admin@gtp.com")) &&
          u.passwordHash === passwordHash
      );

      if (!found) {
        return { success: false, message: "Invalid username/email or password." };
      }

      const sessionUser = {
        username: found.username,
        email: found.email,
        role: found.role
      };

      setCurrentUser(sessionUser);
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    } catch (err) {
      return { success: false, message: err.message || "Login failed." };
    }
  };

  const signup = async ({ username, email, password, role }) => {
    try {
      const trimmedName = username.trim();
      const normalizedEmail = email.trim().toLowerCase();

      if (!trimmedName || !normalizedEmail || !password) {
        return { success: false, message: "Please fill in all required fields." };
      }

      if (password.length < 6) {
        return { success: false, message: "Password must be at least 6 characters long." };
      }

      const users = parse(STORAGE_KEYS.users, []);
      const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);

      if (exists) {
        return { success: false, message: "This email is already registered. Please log in." };
      }

      const passwordHash = await hashPassword(password);
      const newUser = {
        username: trimmedName,
        email: normalizedEmail,
        passwordHash,
        role: role || "player"
      };

      users.push(newUser);
      save(STORAGE_KEYS.users, users);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || "Signup failed." };
    }
  };

  const logout = () => {
    clearCurrentUser();
    setUser(null);
  };

  // Demo helper: quick login with seeded accounts
  const quickLogin = async (roleName) => {
    const roleMap = {
      admin: { email: "admin@gtp.com", pass: "admin123" },
      organizer: { email: "organizer@gtp.com", pass: "organizer123" },
      player: { email: "player@gtp.com", pass: "player123" },
      spectator: { email: "spectator@gtp.com", pass: "spectator123" }
    };

    const target = roleMap[roleName] || roleMap.player;
    return await login(target.email, target.pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        quickLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
