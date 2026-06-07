import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorModal } from "./components/ErrorModal";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ToastProvider } from "./components/ToastProvider";
import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";

function LobbyPage() {
  return (
    <main className="lobby-page">
      <h1>Lobby</h1>
      <p>Authenticated lobby entry point.</p>
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/lobby"
          element={
            <ProtectedRoute>
              <LobbyPage />
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
