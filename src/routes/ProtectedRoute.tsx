import { Navigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../stores/authStore";
import { useErrorStore } from "../stores/errorStore";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const invalidReason = useAuthStore((state) => state.invalidReason);
  const showInvalidSessionPrompt = useErrorStore((state) => state.showInvalidSessionPrompt);

  useEffect(() => {
    if (invalidReason) {
      showInvalidSessionPrompt();
    }
  }, [invalidReason, showInvalidSessionPrompt]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
