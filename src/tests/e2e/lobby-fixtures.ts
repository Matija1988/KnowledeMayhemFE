import type { Page } from "@playwright/test";

export const hostToken =
  "e30." +
  toBase64Url(JSON.stringify({ sub: "user-1", exp: Math.floor(Date.now() / 1000) + 3600 })) +
  ".sig";

export const guestToken =
  "e30." +
  toBase64Url(JSON.stringify({ sub: "user-2", exp: Math.floor(Date.now() / 1000) + 3600 })) +
  ".sig";

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export type LobbySetupPlayerDto = {
  userId: string;
  username: string | null;
  joinedAtUtc: string;
  selectedPieceColor: string | null;
  isReady: boolean;
};

export type LobbySetupLobbyDto = {
  id: string;
  code: string;
  hostUserId: string;
  status: string;
  maxPlayers: number;
  expiresAtUtc: string;
  createdAtUtc: string;
  startedAtUtc: string | null;
  closedAtUtc: string | null;
  selectedCategoryIds: string[];
  setupStatus: string;
  setupVersion: number;
  updatedAtUtc: string | null;
  players: LobbySetupPlayerDto[];
};

export const openLobby: LobbySetupLobbyDto = {
  id: "lobby-1",
  code: "ABC123",
  hostUserId: "user-1",
  status: "Open",
  maxPlayers: 4,
  expiresAtUtc: "2099-06-16T10:30:00.000Z",
  createdAtUtc: "2026-06-16T10:00:00.000Z",
  startedAtUtc: null,
  closedAtUtc: null,
  selectedCategoryIds: [],
  setupStatus: "Pending",
  setupVersion: 0,
  updatedAtUtc: null,
  players: [{ userId: "user-1", username: "Alice", joinedAtUtc: "2026-06-16T10:00:00.000Z", selectedPieceColor: null, isReady: false }],
};

export const lobbyWithGuest = {
  ...openLobby,
  players: [
    ...openLobby.players,
    { userId: "user-2", username: "Bob", joinedAtUtc: "2026-06-16T10:01:00.000Z", selectedPieceColor: null, isReady: false },
  ],
} satisfies LobbySetupLobbyDto;

export const setupCategories = [
  {
    id: "cat-csharp",
    name: "C#",
    description: "C# questions",
    createdAt: "2026-06-16T10:00:00.000Z",
    updatedAt: null,
    isActive: true,
    deletedAt: null,
  },
  {
    id: "cat-sql",
    name: "SQL",
    description: "SQL questions",
    createdAt: "2026-06-16T10:00:00.000Z",
    updatedAt: null,
    isActive: true,
    deletedAt: null,
  },
];

export type LobbySetupE2EState = {
  current: LobbySetupLobbyDto;
};

export async function signIn(page: Page, token = hostToken) {
  await page.addInitScript((accessToken) => {
    window.localStorage.setItem("knowledge-mayhem.auth", JSON.stringify({ accessToken }));
  }, token);
}

export async function installLobbyHubMock(page: Page) {
  await page.addInitScript(() => {
    type Callback = (...args: unknown[]) => void;
    const callbacks = new Map<string, Callback[]>();
    const lifecycle = {
      reconnecting: undefined as Callback | undefined,
      reconnected: undefined as Callback | undefined,
      closed: undefined as Callback | undefined,
    };

    (window as unknown as { __knowledgeMayhemLobbyHubTest: unknown }).__knowledgeMayhemLobbyHubTest = {
      dispatch(eventName: string, payload: unknown) {
        for (const callback of callbacks.get(eventName) ?? []) {
          callback(payload);
        }
      },
      reconnecting() {
        lifecycle.reconnecting?.();
      },
      reconnected() {
        lifecycle.reconnected?.();
      },
      closed() {
        lifecycle.closed?.();
      },
    };

    window.__knowledgeMayhemCreateLobbyHubConnection = () => ({
      on(eventName, callback) {
        callbacks.set(eventName, [...(callbacks.get(eventName) ?? []), callback]);
      },
      invoke: async () => undefined,
      start: async () => undefined,
      stop: async () => undefined,
      onreconnecting(callback) {
        lifecycle.reconnecting = callback;
      },
      onreconnected(callback) {
        lifecycle.reconnected = callback;
      },
      onclose(callback) {
        lifecycle.closed = callback;
      },
    });
  });
}

export async function dispatchLobbySetupChanged(page: Page, lobby: LobbySetupLobbyDto, reason: string) {
  await page.evaluate(
    ({ nextLobby, changeReason }) => {
      (
        window as unknown as {
          __knowledgeMayhemLobbyHubTest: { dispatch: (eventName: string, payload: unknown) => void };
        }
      ).__knowledgeMayhemLobbyHubTest.dispatch("LobbySetupChanged", {
        lobbyId: nextLobby.id,
        lobby: nextLobby,
        reason: changeReason,
      });
    },
    { nextLobby: lobby, changeReason: reason },
  );
}

export async function triggerLobbyReconnect(page: Page) {
  await page.evaluate(() => {
    (
      window as unknown as {
        __knowledgeMayhemLobbyHubTest: { reconnecting: () => void; reconnected: () => void };
      }
    ).__knowledgeMayhemLobbyHubTest.reconnecting();
  });
}

export async function finishLobbyReconnect(page: Page) {
  await page.evaluate(() => {
    (
      window as unknown as {
        __knowledgeMayhemLobbyHubTest: { reconnected: () => void };
      }
    ).__knowledgeMayhemLobbyHubTest.reconnected();
  });
}

export async function routeLobbySetupApi(page: Page, state: LobbySetupE2EState, userId: "user-1" | "user-2") {
  await page.route("**/api/question-bank/categories**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(setupCategories) });
  });
  await page.route("**/api/lobbies/lobby-1/setup/categories", async (route) => {
    const body = route.request().postDataJSON() as { categoryIds: string[] };
    state.current = recalculateSetup({
      ...state.current,
      selectedCategoryIds: body.categoryIds,
      players: state.current.players.map((player) => ({ ...player, isReady: false })),
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(state.current) });
  });
  await page.route("**/api/lobbies/lobby-1/setup/color", async (route) => {
    const body = route.request().postDataJSON() as { pieceColor: string };
    state.current = recalculateSetup({
      ...state.current,
      players: state.current.players.map((player) =>
        player.userId === userId ? { ...player, selectedPieceColor: body.pieceColor, isReady: false } : player,
      ),
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(state.current) });
  });
  await page.route("**/api/lobbies/lobby-1/setup/ready", async (route) => {
    const body = route.request().postDataJSON() as { isReady: boolean };
    state.current = recalculateSetup({
      ...state.current,
      players: state.current.players.map((player) => (player.userId === userId ? { ...player, isReady: body.isReady } : player)),
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(state.current) });
  });
  await page.route("**/api/lobbies/lobby-1/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        sessionId: "session-1",
        initialState: {
          lobbyId: "lobby-1",
          orderedPlayerIds: ["user-1", "user-2"],
          createdAtUtc: "2026-06-16T10:02:00.000Z",
          selectedCategoryIds: state.current.selectedCategoryIds,
          playerColors: Object.fromEntries(state.current.players.map((player) => [player.userId, player.selectedPieceColor])),
        },
        lobby: { ...state.current, status: "Started", startedAtUtc: "2026-06-16T10:02:00.000Z" },
      }),
    });
  });
  await page.route("**/api/lobbies/lobby-1", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(state.current) });
  });
}

export async function routeLobbyApi(page: Page) {
  await page.route("**/api/lobbies/", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(openLobby) });
  });
  await page.route("**/api/lobbies/join", async (route) => {
    const body = route.request().postDataJSON() as { code: string };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...lobbyWithGuest, code: body.code }),
    });
  });
  await page.route("**/api/lobbies/lobby-1", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(lobbyWithGuest) });
  });
  await page.route("**/api/lobbies/lobby-1/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        sessionId: "session-1",
        initialState: {
          lobbyId: "lobby-1",
          orderedPlayerIds: ["user-1", "user-2"],
          createdAtUtc: "2026-06-16T10:02:00.000Z",
        },
        lobby: { ...lobbyWithGuest, status: "Started", startedAtUtc: "2026-06-16T10:02:00.000Z" },
      }),
    });
  });
  await page.route("**/api/lobbies/lobby-1/cancel", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ lobby: { ...lobbyWithGuest, status: "Cancelled" } }),
    });
  });
  await page.route("**/api/lobbies/lobby-1/leave", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ lobby: null, closed: true }) });
  });
}

function recalculateSetup(nextLobby: LobbySetupLobbyDto): LobbySetupLobbyDto {
  const selectedColors = nextLobby.players.map((player) => player.selectedPieceColor).filter(Boolean);
  const hasUniqueColors = selectedColors.length === nextLobby.players.length && new Set(selectedColors).size === selectedColors.length;
  const setupStatus =
    nextLobby.selectedCategoryIds.length > 0 &&
    nextLobby.players.length >= 2 &&
    hasUniqueColors &&
    nextLobby.players.every((player) => player.isReady)
      ? "Ready"
      : "Pending";

  return {
    ...nextLobby,
    setupStatus,
    setupVersion: nextLobby.setupVersion + 1,
    updatedAtUtc: new Date().toISOString(),
  };
}
