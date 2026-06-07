import type { LoginCredentials, LoginResponse } from "../../domain/auth";

export const validCredentials: LoginCredentials = {
  usernameOrEmail: "alice",
  password: "P@ssword123!",
};

export const invalidCredentials: LoginCredentials = {
  usernameOrEmail: "alice",
  password: "wrong-password",
};

export const loginResponse: LoginResponse = {
  accessToken: "test-access-token",
};

export const authProblem = {
  title: "Invalid credentials",
  detail: "Invalid username/email or password.",
  status: 401,
  traceId: "trace-test",
};

export function expiredJwt(): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const payload = btoa(JSON.stringify({ exp: 1 })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${payload}.`;
}
