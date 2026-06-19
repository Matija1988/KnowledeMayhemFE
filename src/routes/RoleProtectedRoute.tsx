import { Navigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { canAccessQuestionBank, getUserRoleFromJwt, type UserRole } from "../domain/auth";
import { useAuthStore } from "../stores/authStore";
import { useErrorStore } from "../stores/errorStore";

type RoleProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export function RoleProtectedRoute({ children, allowedRoles = ["Admin", "Moderator"] }: RoleProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const showError = useErrorStore((state) => state.showError);
  const role = getUserRoleFromJwt(accessToken);
  const isAllowed = canAccessQuestionBank(role) && allowedRoles.includes(role);

  useEffect(() => {
    if (isAuthenticated && !isAllowed) {
      showError({
        title: "Permission denied",
        message: "You do not have permission to open question bank management.",
        displayMode: "modal",
      });
    }
  }, [isAuthenticated, isAllowed, showError]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAllowed) {
    return (
      <main className="question-bank-page">
        <section className="ui-card" role="alert" aria-live="assertive">
          <h1>Permission denied</h1>
          <p>You do not have permission to open question bank management.</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
