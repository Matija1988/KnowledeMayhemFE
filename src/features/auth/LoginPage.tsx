import { Navigate } from "react-router-dom";
import { getDefaultAuthenticatedPath } from "../../domain/auth";
import { LoginForm } from "./LoginForm";
import { useAuthSession } from "../../hooks/useAuthSession";

export function LoginPage() {
  const { accessToken, isAuthenticated } = useAuthSession();

  if (isAuthenticated) {
    return <Navigate to={getDefaultAuthenticatedPath(accessToken)} replace />;
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-heading">
        <h1 id="login-heading">Sign in</h1>
        <LoginForm />
      </section>
    </main>
  );
}
