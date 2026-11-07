# Gaming Tournament Portal (GTP)

A responsive esports tournament platform built with **React**, **Vite**, and **WebRTC** for real-time peer-to-peer match telemetry, YouTube live streaming, local file-based database persistence, and role-based tournament management.

---

## Features & Modules

- **Team Roster & Player Cards (`/about`)**:
  - Interactive Valorant-style player cards for the 3-engineer development team.
  - Strict 9:16 vertical card portrait aspect ratio with offline-ready local assets (`public/assets/images/cards/`).
  - Smooth, minimalist hover zoom on both the card and the portrait (no yaw, pitch, or roll).
  - Built-in live roster editor and detailed contribution modal.

- **Local File Database (`data/db.json`) & Multi-Session Support**:
  - Direct persistence to `./data/db.json` via Vite's internal API middleware.
  - Changes are shared across multiple browser tabs, incognito sessions, and local network devices without requiring a separate backend process.
  - Graceful automatic fallback to `localStorage` in static/offline environments.

- **Authentication System (`/login`, `/signup`)**:
  - Supports login with **either username or email** (e.g., `player`, `candy1912`, or `player@gtp.com`).
  - SHA-256 client password hashing via Web Crypto API.
  - Role-based protected routing (`admin` / `organizer`, `player`, `spectator`).

- **WebRTC Peer-to-Peer Telemetry**:
  - Direct browser-to-browser telemetry via `RTCDataChannel` (scores, round clock, events).
  - In-app diagnostics modal and standalone Node.js CLI verification script.

- **Esports Broadcast Integration (`/spectator`)**:
  - Embedded 16:9 YouTube live player with quick presets (Valorant, CS2, Apex Legends).
  - Admin stream URL / ID manager for live stream switching.
  - Live fan reaction counters.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. The local database middleware automatically serves and synchronizes `./data/db.json`.

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## Pre-Configured Accounts for Review

The portal includes pre-seeded accounts. You can log in using either the username or email:

| Role | Username / Email | Password | Access & Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin / Organizer** | `admin` or `admin@gtp.com` | `admin123` | Create tournaments, award match points, broadcast WebRTC telemetry, manage stream & prizes |
| **Player** | `player`, `candy1912`, or `player@gtp.com` | `player123` | Register for tournaments, form teams/squads, view schedule, receive WebRTC scores |
| **Spectator** | `spectator`, `SpectatorOne`, or `spectator@gtp.com` | `spectator123` | Watch live stream, view real-time WebRTC scoreboard, send live cheers |

*New accounts can also be created via the **Signup** page with any username, email, and role.*

---

## WebRTC Game Data Transmission

This project implements WebRTC peer-to-peer data transmission using `RTCDataChannel`:

### In-Browser Multi-Tab Telemetry
- **Admin**: Acts as Broadcaster. Enter score updates in the Admin Portal and click **"Broadcast Changes via WebRTC"**.
- **Player & Spectator**: Receive telemetry packets via `dataChannel.onmessage` and update the live scoreboard with sub-millisecond latency.
- **In-App Verifier**: Click **"WebRTC Diagnostics"** in the navigation bar to run an immediate loopback test measuring latency and SDP handshake steps.

### Standalone CLI Verification
To verify telemetry transmission directly from your terminal:
```bash
node scripts/webrtc-demo.js
```

---

## Project Structure

```
Gaming-Tournament-Portal/
├── index.html                     # Vite entry HTML (Rajdhani & Teko fonts)
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite config + local file DB middleware
├── vercel.json                    # Single-page routing configuration
├── data/
│   └── db.json                    # Local file database for multi-session persistence
├── public/
│   └── assets/                    # Videos, panels, and 9:16 player card portraits
├── scripts/
│   ├── webrtc-demo.js             # Standalone CLI WebRTC telemetry demo
│   └── README.md                  # WebRTC documentation
├── src/
│   ├── main.jsx                   # React root entry
│   ├── App.jsx                    # Route configuration & providers
│   ├── styles/
│   │   └── main.css               # Clean dark-mode esports theme
│   ├── services/
│   │   ├── storage.js             # Dual-layer storage (db.json sync + localStorage fallback)
│   │   └── webrtc.js              # RTCPeerConnection & RTCDataChannel engine
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state (username/email login, role check)
│   ├── components/
│   │   ├── common/                # Navbar, Footer, BackgroundVideo, ProtectedRoute
│   │   ├── stream/                # LiveStreamEmbed (YouTube player)
│   │   └── webrtc/                # Telemetry widgets and P2P Verifier modal
│   └── modules/
│       ├── home/                  # Landing page & feature cards
│       ├── auth/                  # Clean Login & Signup pages
│       ├── admin/                 # Organizer control center
│       ├── player/                # Competitor hub & team builder
│       ├── spectator/             # Broadcast & fan stream hub
│       └── about/                 # Team showcase with 9:16 player cards
└── legacy_static/                 # Original HTML/CSS static files
```

---

## Deployment to Vercel

The project is configured for single-command deployment via `vercel.json`:
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Framework Preset: **Vite**.
4. Click **Deploy**. SPA routing and client-side persistence will work automatically.
