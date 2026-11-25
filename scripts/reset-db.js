import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DB_DIR = path.join(ROOT_DIR, "data");
const DB_FILE = path.join(DB_DIR, "db.json");

export function getDefaultDbData() {
  return {
    _resetVersion: Date.now(),
    users: [
      {
        username: "AdminGT",
        email: "admin@gtp.com",
        passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
        role: "admin"
      },
      {
        username: "OrganizerPro",
        email: "organizer@gtp.com",
        passwordHash: "9ed814e67a9da028eea6f1984a8bdecf9b50c7aec557df25331d66834656eb77",
        role: "organizer"
      },
      {
        username: "candy1912",
        email: "player@gtp.com",
        passwordHash: "e41abfd6daf8ad3289f41e5ed0cfe8f5c705dbb40531efdf63e110118b7594f2",
        role: "player"
      },
      {
        username: "SpectatorOne",
        email: "spectator@gtp.com",
        passwordHash: "3abbb2b517aae55fdc2dd4ef8e72cd298d35feea7c8b267dda6dfa71076d080a",
        role: "spectator"
      }
    ],
    tournamentRequests: [
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
    ],
    tournaments: [
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
    ],
    leaderboard: [
      { name: "Team Phoenix", points: 45, wins: 4, matches: 5 },
      { name: "Night Raiders", points: 35, wins: 3, matches: 4 },
      { name: "Pixel Squad", points: 28, wins: 2, matches: 4 },
      { name: "Apex Predators", points: 22, wins: 2, matches: 3 },
      { name: "Cyber Knights", points: 15, wins: 1, matches: 3 }
    ],
    announcements: [
      "Valorant Weekend Cup Grand Finals are LIVE now! Watch stream in Spectator Portal.",
      "Prize pool for BGMI Showdown increased to $1,000 courtesy of sponsors.",
      "WebRTC live telemetry enabled: transmit match scores directly peer-to-peer.",
      "Welcome to the Gaming Tournament Portal! Registrations are open for all listed tournaments."
    ],
    reactions: { "🔥": 42, "👏": 28, "🎮": 65, "🏆": 31, "❤️": 19, "⚡": 37 },
    streamConfig: {
      activeId: "jfKfPfyJRdk",
      title: "Official GTP Esports Main Stage",
      presets: [
        { name: "VCT Highlights & Live", videoId: "jfKfPfyJRdk" },
        { name: "CS2 Esports Arena", videoId: "5qap5aO4i9A" },
        { name: "Apex Legends Showcase", videoId: "kXYiU_JCYtU" }
      ]
    },
    liveMatchState: {
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
      lastUpdated: "9:36:57 am"
    },
    registrations: {
      "valorant-cup": ["player@gtp.com"],
      "fifa-clash": []
    },
    teams: [
      {
        owner: "player@gtp.com",
        name: "Team Phoenix",
        members: ["candy1912", "Alex", "Viper", "Sova", "Cypher"]
      }
    ],
    prizes: {
      "valorant-cup": "1st: $350 + Trophy, 2nd: $150",
      "fifa-clash": "Winner: $300 + Gold Medal"
    }
  };
}

export function resetDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const data = getDefaultDbData();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  resetDatabase();
  console.log("[LocalDB] Database reset to default state:", DB_FILE);
}
