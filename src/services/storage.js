// Storage keys and default seed data for Gaming Tournament Portal

export const STORAGE_KEYS = {
  users: "gtp_users",
  session: "gtp_session",
  tournaments: "gtp_tournaments",
  tournamentRequests: "gtp_tournament_requests",
  registrations: "gtp_registrations",
  teams: "gtp_teams",
  leaderboard: "gtp_leaderboard",
  announcements: "gtp_announcements",
  prizes: "gtp_prizes",
  reactions: "gtp_reactions",
  streamConfig: "gtp_stream_config",
  liveMatchState: "gtp_live_match_state"
};

export const defaultTournaments = [
  {
    id: "valorant-cup",
    name: "Valorant Weekend Cup",
    game: "Valorant",
    date: "2026-10-01 17:00",
    mode: "Online",
    prize: "$500 + MVP Badge",
    status: "Live",
    description: "5v5 Competitive tournament on Haven & Ascent. Single elimination format."
  },
  {
    id: "fifa-clash",
    name: "FIFA Arena Clash",
    game: "EA Sports FC 24 / FIFA",
    date: "2026-10-03 14:00",
    mode: "In-person",
    prize: "$300 Cash",
    status: "Upcoming",
    description: "1v1 LAN tournament at Main Gaming Arena. Bring your own controller."
  },
  {
    id: "bgmi-showdown",
    name: "BGMI Showdown",
    game: "BGMI / PUBG Mobile",
    date: "2026-10-05 19:00",
    mode: "Online",
    prize: "$1,000 Pool",
    status: "Upcoming",
    description: "Squad Battle Royale. 4 matches across Erangel, Miramar, and Sanhok."
  },
  {
    id: "cs2-invitational",
    name: "CS2 Pro Invitational",
    game: "Counter-Strike 2",
    date: "2026-10-10 20:00",
    mode: "Online",
    prize: "$2,500 Championship",
    status: "Upcoming",
    description: "MR12 format, competitive map pool with active anti-cheat enforcement."
  }
];

export const defaultTournamentRequests = [
  {
    id: "rocket-league-nitro-101",
    name: "Rocket League Nitro Cup",
    game: "Rocket League",
    date: "2026-10-18 18:30",
    mode: "Online",
    prize: "$750 Cash Pool",
    description: "3v3 Soccar double-elimination bracket with standard competitive settings.",
    requestedBy: "OrganizerPro",
    requestedByEmail: "organizer@gtp.com",
    requestedAt: "2026-10-01T10:00:00.000Z",
    status: "Pending"
  },
  {
    id: "dota2-autumn-clash-102",
    name: "Dota 2 Autumn Clash",
    game: "Dota 2",
    date: "2026-10-22 19:00",
    mode: "Hybrid",
    prize: "$1,500 + Aegis Replica",
    description: "5v5 Captains Mode tournament. Group stage online, finals on main stage.",
    requestedBy: "OrganizerPro",
    requestedByEmail: "organizer@gtp.com",
    requestedAt: "2026-10-01T11:15:00.000Z",
    status: "Pending"
  }
];

export const defaultLeaderboard = [
  { name: "Team Phoenix", points: 45, wins: 4, matches: 5 },
  { name: "Night Raiders", points: 35, wins: 3, matches: 4 },
  { name: "Pixel Squad", points: 28, wins: 2, matches: 4 },
  { name: "Apex Predators", points: 22, wins: 2, matches: 3 },
  { name: "Cyber Knights", points: 15, wins: 1, matches: 3 }
];

export const defaultAnnouncements = [
  "🔥 Valorant Weekend Cup Grand Finals are LIVE now! Watch stream in Spectator Portal.",
  "🏆 Prize pool for BGMI Showdown increased to $1,000 courtesy of sponsors.",
  "⚡ WebRTC live telemetry enabled: transmit match scores directly peer-to-peer.",
  "Welcome to the Gaming Tournament Portal! Registrations are open for all listed tournaments."
];

export const reactionOptions = ["🔥", "👏", "🎮", "🏆", "❤️", "⚡"];

export const defaultStreamConfig = {
  activeId: "jfKfPfyJRdk", // Lofi gaming / ambient esports stream
  title: "Official GTP Esports Main Stage",
  presets: [
    { name: "VCT Highlights & Live", videoId: "jfKfPfyJRdk" },
    { name: "CS2 Esports Arena", videoId: "5qap5aO4i9A" },
    { name: "Apex Legends Showcase", videoId: "kXYiU_JCYtU" }
  ]
};

export const defaultLiveMatchState = {
  tournamentId: "valorant-cup",
  matchTitle: "Grand Finals: Team Phoenix vs Night Raiders",
  map: "Haven",
  scoreA: 11,
  scoreB: 9,
  teamA: "Team Phoenix",
  teamB: "Night Raiders",
  round: 21,
  roundTime: "0:45",
  status: "In Progress",
  recentEvent: "Phoenix_Reyna clutched 1v2 on A Site!",
  lastUpdated: new Date().toLocaleTimeString()
};

// Default seed users:
// Admin: admin / admin@gtp.com / admin123
// Organizer: organizer / organizer@gtp.com / organizer123
// Player: player / candy1912 / player@gtp.com / player123
// Spectator: spectator / SpectatorOne / spectator@gtp.com / spectator123
export const defaultUsers = [
  {
    username: "AdminGT",
    email: "admin@gtp.com",
    // SHA-256 for "admin123"
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
    role: "admin"
  },
  {
    username: "OrganizerPro",
    email: "organizer@gtp.com",
    // SHA-256 for "organizer123"
    passwordHash: "9ed814e67a9da028eea6f1984a8bdecf9b50c7aec557df25331d66834656eb77",
    role: "organizer"
  },
  {
    username: "candy1912",
    email: "player@gtp.com",
    // SHA-256 for "player123"
    passwordHash: "e41abfd6daf8ad3289f41e5ed0cfe8f5c705dbb40531efdf63e110118b7594f2",
    role: "player"
  },
  {
    username: "SpectatorOne",
    email: "spectator@gtp.com",
    // SHA-256 for "spectator123"
    passwordHash: "3abbb2b517aae55fdc2dd4ef8e72cd298d35feea7c8b267dda6dfa71076d080a",
    role: "spectator"
  }
];

const keyToCollection = {
  gtp_users: "users",
  gtp_tournaments: "tournaments",
  gtp_tournament_requests: "tournamentRequests",
  gtp_leaderboard: "leaderboard",
  gtp_announcements: "announcements",
  gtp_reactions: "reactions",
  gtp_stream_config: "streamConfig",
  gtp_live_match_state: "liveMatchState",
  gtp_registrations: "registrations",
  gtp_teams: "teams",
  gtp_prizes: "prizes",
  gtp_team_roster: "roster"
};

export const parse = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const save = (key, value) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));

  // Persist to local data/db.json file when running with Vite / backend
  const collection = keyToCollection[key];
  if (collection && typeof window.fetch === "function") {
    fetch(`/api/db/${collection}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value)
    }).catch(() => {
      // Graceful fallback to localStorage
    });
  }
};

export async function syncFromBackendDb() {
  if (typeof window === "undefined" || typeof window.fetch !== "function") return;
  try {
    const res = await fetch("/api/db");
    if (!res.ok) return;
    const db = await res.json();
    if (db && typeof db === "object") {
      if (db._resetVersion) {
        const prevResetVersion = localStorage.getItem("gtp_reset_version");
        if (String(db._resetVersion) !== prevResetVersion) {
          Object.keys(localStorage)
            .filter((k) => k.startsWith("gtp_"))
            .forEach((k) => localStorage.removeItem(k));
          localStorage.setItem("gtp_reset_version", String(db._resetVersion));
        }
      }
      Object.entries(keyToCollection).forEach(([storageKey, coll]) => {
        if (db[coll] !== undefined) {
          localStorage.setItem(storageKey, JSON.stringify(db[coll]));
        }
      });
      window.dispatchEvent(new Event("gtp-db-synced"));
    }
  } catch {
    // Offline or static preview fallback
  }
}

export async function hashPassword(password) {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const bytes = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
  // Simple fallback hash for environments where crypto.subtle is restricted
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(16);
}

export function ensureDefaults() {
  if (typeof window === "undefined") return;

  // Background sync with local ./data/db.json
  syncFromBackendDb();

  if (!localStorage.getItem(STORAGE_KEYS.tournaments)) {
    save(STORAGE_KEYS.tournaments, defaultTournaments);
  }
  if (!localStorage.getItem(STORAGE_KEYS.tournamentRequests)) {
    save(STORAGE_KEYS.tournamentRequests, defaultTournamentRequests);
  }
  if (!localStorage.getItem(STORAGE_KEYS.leaderboard)) {
    save(STORAGE_KEYS.leaderboard, defaultLeaderboard);
  }
  if (!localStorage.getItem(STORAGE_KEYS.announcements)) {
    save(STORAGE_KEYS.announcements, defaultAnnouncements);
  }
  if (!localStorage.getItem(STORAGE_KEYS.reactions)) {
    const defaultReactions = { "🔥": 42, "👏": 28, "🎮": 65, "🏆": 31, "❤️": 19, "⚡": 37 };
    save(STORAGE_KEYS.reactions, defaultReactions);
  }
  const storedUsers = parse(STORAGE_KEYS.users, null);
  if (!storedUsers || !Array.isArray(storedUsers)) {
    save(STORAGE_KEYS.users, defaultUsers);
  } else {
    // Self-heal: ensure default accounts have correct hashes and roles
    let modified = false;
    defaultUsers.forEach((def) => {
      const existing = storedUsers.find(
        (u) => u.email.toLowerCase() === def.email.toLowerCase()
      );
      if (!existing) {
        storedUsers.push(def);
        modified = true;
      } else {
        if (existing.passwordHash !== def.passwordHash) {
          existing.passwordHash = def.passwordHash;
          modified = true;
        }
        if (existing.role !== def.role) {
          existing.role = def.role;
          modified = true;
        }
      }
    });
    if (modified) {
      save(STORAGE_KEYS.users, storedUsers);
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.streamConfig)) {
    save(STORAGE_KEYS.streamConfig, defaultStreamConfig);
  }
  if (!localStorage.getItem(STORAGE_KEYS.liveMatchState)) {
    save(STORAGE_KEYS.liveMatchState, defaultLiveMatchState);
  }
  if (!localStorage.getItem(STORAGE_KEYS.registrations)) {
    save(STORAGE_KEYS.registrations, {
      "valorant-cup": ["player@gtp.com"],
      "fifa-clash": []
    });
  }
  if (!localStorage.getItem(STORAGE_KEYS.teams)) {
    save(STORAGE_KEYS.teams, [
      {
        owner: "player@gtp.com",
        name: "Team Phoenix",
        members: ["candy1912", "Alex", "Viper", "Sova", "Cypher"]
      }
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.prizes)) {
    save(STORAGE_KEYS.prizes, {
      "valorant-cup": "1st: $350 + Trophy, 2nd: $150",
      "fifa-clash": "Winner: $300 + Gold Medal"
    });
  }
}

export function getCurrentUser() {
  return parse(STORAGE_KEYS.session, null);
}

export function setCurrentUser(user) {
  save(STORAGE_KEYS.session, user);
}

export function clearCurrentUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.session);
  }
}
