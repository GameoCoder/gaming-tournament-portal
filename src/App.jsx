import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { BackgroundVideo } from "./components/common/BackgroundVideo";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { WebRTCDemoModal } from "./components/webrtc/WebRTCDemoModal";

// Modules
import { HomePage } from "./modules/home/HomePage";
import { LoginPage } from "./modules/auth/LoginPage";
import { SignupPage } from "./modules/auth/SignupPage";
import { AdminDashboard } from "./modules/admin/AdminDashboard";
import { PlayerDashboard } from "./modules/player/PlayerDashboard";
import { SpectatorDashboard } from "./modules/spectator/SpectatorDashboard";
import { AboutPage } from "./modules/about/AboutPage";

export const App = () => {
  const [isWebRTCModalOpen, setIsWebRTCModalOpen] = useState(false);

  const openWebRTCModal = () => setIsWebRTCModalOpen(true);
  const closeWebRTCModal = () => setIsWebRTCModalOpen(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <BackgroundVideo />
        <Navbar onOpenWebRTCModal={openWebRTCModal} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/about"
            element={<AboutPage onOpenWebRTCModal={openWebRTCModal} />}
          />

          {/* Module: Admin / Organizer */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["organizer", "admin"]}>
                <AdminDashboard onOpenWebRTCModal={openWebRTCModal} />
              </ProtectedRoute>
            }
          />

          {/* Module: User / Player */}
          <Route
            path="/player"
            element={
              <ProtectedRoute allowedRoles={["player", "organizer", "admin"]}>
                <PlayerDashboard onOpenWebRTCModal={openWebRTCModal} />
              </ProtectedRoute>
            }
          />

          {/* Module: Spectator / Public */}
          <Route
            path="/spectator"
            element={<SpectatorDashboard onOpenWebRTCModal={openWebRTCModal} />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />

        {/* Global WebRTC Demo Modal */}
        <WebRTCDemoModal
          isOpen={isWebRTCModalOpen}
          onClose={closeWebRTCModal}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
