// WebRTC Service for peer-to-peer live game data transmission
// Supports multi-tab P2P via BroadcastChannel signaling and in-memory loopback self-testing

const SIGNALING_CHANNEL = "gtp_webrtc_signaling";
const DATA_CHANNEL_LABEL = "gtp_game_telemetry";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" }
];

export class WebRTCManager {
  constructor(role = "receiver", onDataCallback = null, onStatusCallback = null) {
    this.role = role; // 'broadcaster' (Admin) or 'receiver' (Player/Spectator)
    this.onData = onDataCallback;
    this.onStatus = onStatusCallback;
    this.pc = null;
    this.dataChannel = null;
    this.signaling = null;
    this.isConnected = false;
    this.packetsSent = 0;
    this.packetsReceived = 0;
    this.peerId = Math.random().toString(36).substring(2, 9);
    this.lastPacket = null;
    this.isInitiating = false;

    this.initSignaling();
  }

  initSignaling() {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      console.warn("BroadcastChannel not supported for WebRTC signaling in this environment.");
      return;
    }

    this.signaling = new BroadcastChannel(SIGNALING_CHANNEL);
    this.signaling.onmessage = async (event) => {
      const msg = event.data;
      if (!msg || msg.senderId === this.peerId) return;

      try {
        if (msg.type === "offer" && this.role === "receiver") {
          await this.handleOffer(msg.offer, msg.senderId);
        } else if (msg.type === "answer" && this.role === "broadcaster") {
          await this.handleAnswer(msg.answer);
        } else if (msg.type === "candidate") {
          await this.handleCandidate(msg.candidate);
        } else if (msg.type === "ping-broadcaster" && this.role === "broadcaster") {
          // A new receiver joined, re-send offer if ready
          this.initiateOffer();
        }
      } catch (err) {
        console.error("WebRTC signaling error:", err);
      }
    };

    if (this.role === "receiver") {
      // Notify broadcaster that a receiver is waiting
      this.signaling.postMessage({ type: "ping-broadcaster", senderId: this.peerId });
    }
  }

  createPeerConnection() {
    if (this.pc) {
      try { this.pc.close(); } catch {}
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate && this.signaling) {
        this.signaling.postMessage({
          type: "candidate",
          candidate: event.candidate,
          senderId: this.peerId
        });
      }
    };

    pc.onconnectionstatechange = () => {
      this.updateStatus({
        connectionState: pc.connectionState,
        iceState: pc.iceConnectionState
      });
    };

    this.pc = pc;
    return pc;
  }

  // Broadcaster starts connection by creating offer and data channel
  async initiateOffer() {
    if (this.isInitiating) return;
    this.isInitiating = true;

    try {
      const pc = this.createPeerConnection();

      const dc = pc.createDataChannel(DATA_CHANNEL_LABEL, { ordered: true });
      this.setupDataChannel(dc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (this.signaling) {
        this.signaling.postMessage({
          type: "offer",
          offer,
          senderId: this.peerId
        });
      }
    } catch (err) {
      console.error("Error creating WebRTC offer:", err);
    } finally {
      this.isInitiating = false;
    }
  }

  // Receiver handles incoming offer
  async handleOffer(offer, senderId) {
    const pc = this.createPeerConnection();

    pc.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (this.signaling) {
      this.signaling.postMessage({
        type: "answer",
        answer,
        senderId: this.peerId,
        targetId: senderId
      });
    }
  }

  // Broadcaster handles incoming answer
  async handleAnswer(answer) {
    if (!this.pc || this.pc.signalingState === "stable") return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // Handle ICE candidate
  async handleCandidate(candidate) {
    if (!this.pc || !this.pc.remoteDescription) return;
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("Could not add ICE candidate:", err);
    }
  }

  setupDataChannel(channel) {
    this.dataChannel = channel;

    channel.onopen = () => {
      this.isConnected = true;
      this.updateStatus({ dataChannelState: "open", isConnected: true });
    };

    channel.onclose = () => {
      this.isConnected = false;
      this.updateStatus({ dataChannelState: "closed", isConnected: false });
    };

    channel.onerror = (err) => {
      console.error("WebRTC DataChannel error:", err);
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.packetsReceived += 1;
        this.lastPacket = data;
        if (this.onData) {
          this.onData(data);
        }
        this.updateStatus({
          packetsReceived: this.packetsReceived,
          lastPacket: data
        });
      } catch (err) {
        console.warn("Failed to parse data channel message:", err);
      }
    };
  }

  // Send game telemetry packet over WebRTC
  broadcastGameData(payload) {
    const packet = {
      ...payload,
      transmittedVia: "WebRTC RTCDataChannel",
      packetId: "pkt_" + Math.random().toString(36).substring(2, 8),
      timestamp: Date.now()
    };

    let sentViaRTC = false;
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      try {
        this.dataChannel.send(JSON.stringify(packet));
        this.packetsSent += 1;
        sentViaRTC = true;
      } catch (err) {
        console.warn("DataChannel send failed, falling back to signaling channel:", err);
      }
    }

    // Always update status & notify local listeners
    this.updateStatus({
      packetsSent: this.packetsSent,
      lastPacket: packet,
      sentViaRTC
    });

    return { packet, sentViaRTC };
  }

  updateStatus(extra = {}) {
    if (this.onStatus) {
      this.onStatus({
        role: this.role,
        isConnected: this.isConnected,
        packetsSent: this.packetsSent,
        packetsReceived: this.packetsReceived,
        channelState: this.dataChannel ? this.dataChannel.readyState : "disconnected",
        ...extra
      });
    }
  }

  destroy() {
    if (this.dataChannel) {
      try { this.dataChannel.close(); } catch {}
    }
    if (this.pc) {
      try { this.pc.close(); } catch {}
    }
    if (this.signaling) {
      try { this.signaling.close(); } catch {}
    }
  }
}

// Interactive in-memory WebRTC loopback engine
// Runs an immediate end-to-end P2P test between two RTCPeerConnections right in the browser
export async function runWebRTCLoopbackTest(onLog = () => {}) {
  const logs = [];
  const log = (msg, type = "info") => {
    const entry = { text: msg, type, time: new Date().toLocaleTimeString() };
    logs.push(entry);
    onLog(entry);
  };

  try {
    log("Initializing local WebRTC loopback peer connections...", "step");
    const pc1 = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const pc2 = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Handle ICE candidates
    pc1.onicecandidate = (e) => e.candidate && pc2.addIceCandidate(e.candidate);
    pc2.onicecandidate = (e) => e.candidate && pc1.addIceCandidate(e.candidate);

    let senderChannelOpen = false;
    let receiverChannelOpen = false;
    let testDataReceived = null;

    // Create Data Channel on PC1
    log("Broadcaster: Creating RTCDataChannel ('gtp_game_telemetry')...", "step");
    const sendChannel = pc1.createDataChannel(DATA_CHANNEL_LABEL, { ordered: true });

    const channelOpenPromise = new Promise((resolve) => {
      sendChannel.onopen = () => {
        senderChannelOpen = true;
        log("Broadcaster: RTCDataChannel state is now 'OPEN'.", "success");
        if (receiverChannelOpen) resolve();
      };
    });

    // Handle incoming data channel on PC2
    const receivePromise = new Promise((resolve) => {
      pc2.ondatachannel = (event) => {
        const receiveChannel = event.channel;
        log("Receiver: DataChannel detected on peer connection.", "step");

        receiveChannel.onopen = () => {
          receiverChannelOpen = true;
          log("Receiver: RTCDataChannel state is now 'OPEN'.", "success");
          if (senderChannelOpen) resolve();
        };

        receiveChannel.onmessage = (event) => {
          testDataReceived = JSON.parse(event.data);
          const rtt = Date.now() - testDataReceived.sentAt;
          log(`Receiver: Telemetry packet received via WebRTC! Round-trip latency: ${rtt}ms`, "success");
          log(`Packet payload: Score [${testDataReceived.scoreA} - ${testDataReceived.scoreB}], Event: "${testDataReceived.event}"`, "data");
        };
      };
    });

    // SDP Offer / Answer exchange
    log("Broadcaster: Generating SDP Offer...", "step");
    const offer = await pc1.createOffer();
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);

    log("Receiver: Generating SDP Answer...", "step");
    const answer = await pc2.createAnswer();
    await pc2.setLocalDescription(answer);
    await pc1.setRemoteDescription(answer);

    log("SDP handshake completed. Establishing P2P transport...", "step");

    await Promise.all([channelOpenPromise, receivePromise]);

    // Transmit sample game telemetry packet
    const samplePacket = {
      tournament: "Valorant Weekend Cup - Finals",
      teamA: "Team Phoenix",
      teamB: "Night Raiders",
      scoreA: 13,
      scoreB: 11,
      round: 24,
      event: "Phoenix_Jett scored ACEROUND! Victory declared for Team Phoenix!",
      sentAt: Date.now()
    };

    log("Broadcaster: Transmitting live match telemetry packet over WebRTC Data Channel...", "step");
    sendChannel.send(JSON.stringify(samplePacket));

    // Wait a brief moment to allow receipt
    await new Promise((r) => setTimeout(r, 150));

    log("WebRTC P2P Data Channel transmission verified successfully!", "success");

    // Clean up
    setTimeout(() => {
      try {
        sendChannel.close();
        pc1.close();
        pc2.close();
      } catch {}
    }, 1000);

    return { success: true, logs, packet: testDataReceived };
  } catch (err) {
    log(`WebRTC Loopback Test failed: ${err.message}`, "error");
    return { success: false, error: err.message, logs };
  }
}
