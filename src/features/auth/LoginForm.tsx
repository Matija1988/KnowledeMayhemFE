import { FormEvent, useState } from "react";
import { useLogin } from "./useLogin";

export function LoginForm() {
  const { submit, isLoading, fieldErrors } = useLogin();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit({ usernameOrEmail, password });
  }

  return (
    <form aria-label="Sign in" className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="usernameOrEmail">Username or email</label>
        <input
          id="usernameOrEmail"
          name="usernameOrEmail"
          autoComplete="username"
          value={usernameOrEmail}
          aria-invalid={Boolean(fieldErrors.usernameOrEmail)}
          aria-describedby={fieldErrors.usernameOrEmail ? "usernameOrEmail-error" : undefined}
          onChange={(event) => setUsernameOrEmail(event.target.value)}
        />
        {fieldErrors.usernameOrEmail ? (
          <p className="field-error" id="usernameOrEmail-error">
            {fieldErrors.usernameOrEmail}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          onChange={(event) => setPassword(event.target.value)}
        />
        {fieldErrors.password ? (
          <p className="field-error" id="password-error">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
      <p aria-live="polite" className="sr-status" role="status">
        {isLoading ? "Sign-in request in progress." : ""}
      </p>
    </form>
  );
}
