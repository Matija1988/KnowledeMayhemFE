import { http, HttpResponse } from "msw";
import { activeLobbyConflict, lobbyFixture, lobbyWithGuest, startLobbyResultFixture } from "../fixtures/lobbyFixtures";

export const lobbyHandlers = [
  http.post("**/api/lobbies/", async ({ request }) => {
    const body = (await request.json()) as { maxPlayers?: number };
    if (body.maxPlayers === 3) {
      return HttpResponse.json(activeLobbyConflict(), { status: 409 });
    }

    return HttpResponse.json(lobbyFixture({ maxPlayers: body.maxPlayers ?? 4 }));
  }),
  http.post("**/api/lobbies/join", async ({ request }) => {
    const body = (await request.json()) as { code?: string };
    if (!body.code) {
      return HttpResponse.json({ title: "Code required", detail: "Enter a lobby code.", status: 400 }, { status: 400 });
    }
    if (body.code === "FULL") {
      return HttpResponse.json({ title: "Lobby is full", status: 409 }, { status: 409 });
    }
    if (body.code === "ACTIVE") {
      return HttpResponse.json(activeLobbyConflict(), { status: 409 });
    }

    return HttpResponse.json(lobbyWithGuest({ code: body.code }));
  }),
  http.get("**/api/lobbies/:lobbyId", ({ params }) =>
    HttpResponse.json(lobbyFixture({ id: String(params.lobbyId) })),
  ),
  http.post("**/api/lobbies/:lobbyId/leave", () => HttpResponse.json({ lobby: null, closed: true })),
  http.post("**/api/lobbies/:lobbyId/cancel", ({ params }) =>
    HttpResponse.json({ lobby: lobbyFixture({ id: String(params.lobbyId), status: "Cancelled" }) }),
  ),
  http.post("**/api/lobbies/:lobbyId/start", () => HttpResponse.json(startLobbyResultFixture())),
];
