import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorModal } from "./components/ErrorModal";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ToastProvider } from "./components/ToastProvider";
import { LoginPage } from "./features/auth/LoginPage";
import { GameSessionPage } from "./features/game/GameSessionPage";
import { LobbyLandingPage } from "./features/lobby/LobbyLandingPage";
import { LobbyRoomPage } from "./features/lobby/LobbyRoomPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/lobby"
          element={
            <ProtectedRoute>
              <LobbyLandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lobby/:lobbyId"
          element={
            <ProtectedRoute>
              <LobbyRoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:sessionId"
          element={
            <ProtectedRoute>
              <GameSessionPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <LoadingSpinner />
      <ToastProvider />
      <ErrorModal />
    </BrowserRouter>
  );
}
