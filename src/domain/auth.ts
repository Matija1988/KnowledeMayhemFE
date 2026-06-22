export type LoginCredentials = {
  usernameOrEmail: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type LogoutStatus = "loggedOut" | "alreadyLoggedOut";

export type LogoutResponse = {
  status: LogoutStatus;
  loggedOutAtUtc: string;
  sessionInvalidated: boolean;
  lobby?: LogoutLobbyOutcome | null;
  game?: LogoutGameOutcome | null;
};

export type LogoutLobbyOutcome = {
  lobbyId: string;
  outcome: string;
  newHostUserId?: string | null;
};

export type LogoutGameOutcome = {
  gameSessionId: string;
  forfeitedPlayerId: string;
  eliminatedAtUtc: string;
  eliminationReason: string;
  pendingAttemptCancelled: boolean;
  cancelledAttempt?: CancelledAttemptOutcome | null;
  gameCompleted: boolean;
  winnerPlayerId?: string | null;
  endedAtUtc?: string | null;
  nextTurnPlayerId?: string | null;
};

export type CancelledAttemptOutcome = {
  attemptId: string;
  kind: string;
  status: string;
  cancelledAtUtc: string;
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

export type UserRole = "Player" | "Moderator" | "Admin";

export type LoadingState = {
  isLoading: boolean;
  operation:
    | "login"
    | "logout"
    | "createLobby"
    | "joinLobby"
    | "readLobby"
    | "leaveLobby"
    | "cancelLobby"
    | "startLobby"
    | "readGame"
    | "movePiece"
    | "startConquest"
    | "submitConquest"
    | "startBattle"
    | "submitBattle"
    | "startSpecialField"
    | "submitSpecialField"
    | "reconnectGame"
    | "listCategories"
    | "createCategory"
    | "updateCategory"
    | "deleteCategory"
    | "listQuestions"
    | "readQuestion"
    | "createQuestion"
    | "updateQuestion"
    | "deleteQuestion"
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
    parsed.userId,
    parsed.uid,
    parsed.nameid,
    parsed["nameid"],
    parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
    parsed.sub,
  ];

  const userId = candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  return userId ? userId.trim() : null;
}

export function getUserRoleFromJwt(accessToken: string | null): UserRole {
  if (!accessToken) {
    return "Player";
  }

  const parsed = parseJwtPayload(accessToken);
  if (!parsed) {
    return "Player";
  }

  return getHighestRecognizedRole(extractRoleClaimValues(parsed));
}

export function getHighestRecognizedRole(values: unknown[]): UserRole {
  const normalized = values
    .flatMap(flattenRoleClaimValue)
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(/[,\s]+/))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (normalized.includes("admin") || normalized.includes("administrator")) {
    return "Admin";
  }
  if (normalized.includes("moderator")) {
    return "Moderator";
  }
  return "Player";
}

export function canAccessQuestionBank(role: UserRole): boolean {
  return role === "Admin" || role === "Moderator";
}

export function canManageCategories(role: UserRole): boolean {
  return role === "Admin";
}

export function getDefaultAuthenticatedPath(accessToken: string | null): string {
  return canAccessQuestionBank(getUserRoleFromJwt(accessToken)) ? "/admin/question-bank" : "/lobby";
}

export function parseJwtPayload(accessToken: string): Record<string, unknown> | null {
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

function extractRoleClaimValues(parsed: Record<string, unknown>): unknown[] {
  return [
    parsed.role,
    parsed.roles,
    parsed.Role,
    parsed.Roles,
    parsed.authority,
    parsed.authorities,
    parsed.permissions,
    parsed.Permission,
    parsed.Permissions,
    parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
    parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"],
    parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid"],
  ];
}

function flattenRoleClaimValue(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenRoleClaimValue);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(flattenRoleClaimValue);
  }

  return [value];
}
