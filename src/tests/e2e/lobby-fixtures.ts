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

export const openLobby = {
  id: "lobby-1",
  code: "ABC123",
  hostUserId: "user-1",
  status: "Open",
  maxPlayers: 4,
  expiresAtUtc: "2099-06-16T10:30:00.000Z",
  createdAtUtc: "2026-06-16T10:00:00.000Z",
  startedAtUtc: null,
  closedAtUtc: null,
  players: [{ userId: "user-1", joinedAtUtc: "2026-06-16T10:00:00.000Z" }],
};

export const lobbyWithGuest = {
  ...openLobby,
  players: [...openLobby.players, { userId: "user-2", joinedAtUtc: "2026-06-16T10:01:00.000Z" }],
};

export async function signIn(page: Page, token = hostToken) {
  await page.addInitScript((accessToken) => {
    window.localStorage.setItem("knowledge-mayhem.auth", JSON.stringify({ accessToken }));
  }, token);
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
