import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorModal } from "./components/ErrorModal";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ToastProvider } from "./components/ToastProvider";
import { AccountSettingsPage } from "./features/accountSettings/AccountSettingsPage";
import { LoginPage } from "./features/auth/LoginPage";
import { GameSessionPage } from "./features/game/GameSessionPage";
import { CategoryListPage } from "./features/questionBank/CategoryListPage";
import { QuestionBankDashboard } from "./features/questionBank/QuestionBankDashboard";
import { QuestionBankLayout } from "./features/questionBank/QuestionBankLayout";
import { QuestionFormPage } from "./features/questionBank/QuestionFormPage";
import { QuestionListPage } from "./features/questionBank/QuestionListPage";
import { LobbyLandingPage } from "./features/lobby/LobbyLandingPage";
import { LobbyRoomPage } from "./features/lobby/LobbyRoomPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleProtectedRoute } from "./routes/RoleProtectedRoute";

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
        <Route
          path="/account/settings"
          element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/question-bank"
          element={
            <RoleProtectedRoute>
              <QuestionBankLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<QuestionBankDashboard />} />
          <Route path="categories" element={<CategoryListPage />} />
          <Route path="questions" element={<QuestionListPage />} />
          <Route path="questions/new" element={<QuestionFormPage />} />
          <Route path="questions/:questionId/edit" element={<QuestionFormPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <LoadingSpinner />
      <ToastProvider />
      <ErrorModal />
    </BrowserRouter>
  );
}
