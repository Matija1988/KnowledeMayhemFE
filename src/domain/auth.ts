export type LoginCredentials = {
  usernameOrEmail: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type AuthenticatedSession = {
  accessToken: string | null;
  isAuthenticated: boolean;
  invalidReason: string | null;
};

export type AuthError = {
  title: string;
  message: string;
  displayMode: "toast" | "modal";
};

export type LoadingState = {
  isLoading: boolean;
  operation:
    | "login"
    | "createLobby"
    | "joinLobby"
    | "readLobby"
    | "leaveLobby"
    | "cancelLobby"
    | "startLobby"
    | "readGame"
    | "movePiece"
    | "reconnectGame"
    | null;
};

export type ProtectedDestination = {
  path: string;
  requiresAuth: boolean;
  fallback: string;
};

export type LoginFieldErrors = Partial<Record<keyof LoginCredentials, string>>;

export function normalizeCredentials(credentials: LoginCredentials): LoginCredentials {
  return {
    usernameOrEmail: credentials.usernameOrEmail.trim(),
    password: credentials.password,
  };
}

export function validateLoginCredentials(credentials: LoginCredentials): LoginFieldErrors {
  const normalized = normalizeCredentials(credentials);
  const errors: LoginFieldErrors = {};

  if (!normalized.usernameOrEmail) {
    errors.usernameOrEmail = "Enter your username or email.";
  }

  if (!normalized.password) {
    errors.password = "Enter your password.";
  }

  return errors;
}

export function hasLoginFieldErrors(errors: LoginFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function mapLoginResponse(response: LoginResponse): AuthenticatedSession {
  if (!response.accessToken) {
    throw new Error("Login response did not include an access token.");
  }

  return {
    accessToken: response.accessToken,
    isAuthenticated: true,
    invalidReason: null,
  };
}

export function createLoggedOutSession(invalidReason: string | null = null): AuthenticatedSession {
  return {
    accessToken: null,
    isAuthenticated: false,
    invalidReason,
  };
}

export function createAuthError(
  message: string,
  displayMode: AuthError["displayMode"] = "toast",
  title = "Sign-in problem",
): AuthError {
  return { title, message, displayMode };
}

export function createInvalidSessionError(): AuthError {
  return createAuthError("Please sign in again.", "toast", "Session expired");
}

export function isJwtExpired(accessToken: string, nowSeconds = Date.now() / 1000): boolean {
  const parsed = parseJwtPayload(accessToken);
  return typeof parsed?.exp === "number" && parsed.exp <= nowSeconds;
}

export function getUserIdFromJwt(accessToken: string): string | null {
  const parsed = parseJwtPayload(accessToken);
  if (!parsed) {
    return null;
  }

  const candidates = [
    parsed.sub,
    parsed.userId,
    parsed.uid,
    parsed.nameid,
    parsed["nameid"],
    parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
  ];

  const userId = candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  return userId ? userId.trim() : null;
}

function parseJwtPayload(accessToken: string): Record<string, unknown> | null {
  const [, payload] = accessToken.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
