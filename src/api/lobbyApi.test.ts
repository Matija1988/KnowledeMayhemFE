import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../tests/setup";
import { activeLobbyConflict, lobbyFixture } from "../tests/fixtures/lobbyFixtures";
import { cancelLobby, createLobby, joinLobby, leaveLobby, normalizeLobbyError, startLobby } from "./lobbyApi";
import { HttpError } from "./httpClient";

describe("lobbyApi", () => {
  it("creates lobbies through the configured API URL with bearer auth", async () => {
    await expect(createLobby(4, { accessToken: "token" })).resolves.toMatchObject({ id: "lobby-1", maxPlayers: 4 });
  });

  it("normalizes join codes before submitting", async () => {
    server.use(
      http.post("**/api/lobbies/join", async ({ request }) => {
        const body = (await request.json()) as { code: string };
        return HttpResponse.json(lobbyFixture({ code: body.code }));
      }),
    );

    await expect(joinLobby(" ab12 ", { accessToken: "token" })).resolves.toMatchObject({ code: "AB12" });
  });

  it("normalizes active lobby conflicts with recovery data", () => {
    const error = normalizeLobbyError(new HttpError(409, activeLobbyConflict() as never));

    expect(error.activeLobby?.id).toBe("lobby-1");
  });

  it("normalizes network errors for CORS guidance", () => {
    expect(normalizeLobbyError(new TypeError("Failed to fetch")).message).toContain("VITE_API_BASE_URL");
  });

  it("calls leave, cancel, and start endpoints", async () => {
    await expect(leaveLobby("lobby-1", { accessToken: "token" })).resolves.toMatchObject({ closed: true });
    await expect(cancelLobby("lobby-1", { accessToken: "token" })).resolves.toMatchObject({
      lobby: { status: "Cancelled" },
    });
    await expect(startLobby("lobby-1", { accessToken: "token" })).resolves.toMatchObject({ sessionId: "session-1" });
  });

  it("normalizes common lobby HTTP errors", () => {
    expect(normalizeLobbyError(new HttpError(403, null)).message).toContain("Only");
    expect(normalizeLobbyError(new HttpError(404, null)).message).toBe("Lobby not found.");
    expect(normalizeLobbyError(new HttpError(409, { title: "Lobby has expired" })).message).toBe("Lobby has expired");
  });
});
