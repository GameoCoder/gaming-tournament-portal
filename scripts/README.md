# WebRTC Telemetry Demonstration Scripts

This directory contains standalone tools and scripts demonstrating live match telemetry transmission using WebRTC Data Channels.

## Requirements Addressed
- **Requirement 1**: Use WebRTC to transmit game data peer-to-peer.
- **Evaluation Criteria 1 & 2**: Module identification, real-time telemetry, and modular architecture.

## Running the Standalone CLI Demo
You can run the demonstration script directly in any terminal:

```bash
node scripts/webrtc-demo.js
```

### What this script demonstrates:
1. **Peer Connection Initialization**: Sets up `RTCPeerConnection` configuration with Google STUN (`stun.l.google.com:19302`).
2. **Data Channel Creation**: Configures `gtp_game_telemetry` RTCDataChannel (ordered, reliable SCTP transport).
3. **Telemetry Packet Transmission**:
   - Match initialization & team roster metadata
   - Live round time ticks
   - Kill feed events with weapon & headshot indicators
   - Objective status (bomb / spike plant & defusal)
   - Dynamic score calculation & round conclusion
   - Grand Finals match victory declaration
4. **Serialization & Latency Measurement**: Calculates frame payload size in bytes and simulates sub-millisecond round-trip transmission latency.

---

## In-Browser Live Multi-Tab WebRTC
The React web application also includes full in-browser P2P WebRTC data transmission:
- **Admin Tab**: Acts as Broadcaster (`src/modules/admin/AdminDashboard.jsx`), generating offers and sending live telemetry packets via `RTCDataChannel.send()`.
- **Spectator / Player Tab**: Acts as Receiver (`src/components/webrtc/WebRTCTelemetryWidget.jsx`), receiving incoming data packets directly via `dataChannel.onmessage` and instantly updating the live scoreboard.
- **Interactive Verifier**: Click the **"WebRTC Demo"** button in the navigation bar from any page to run an immediate in-memory loopback verification test with real-time handshake logs.
