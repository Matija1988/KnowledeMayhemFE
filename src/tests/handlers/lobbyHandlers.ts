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
  http.put("**/api/lobbies/:lobbyId/setup/categories", async ({ params, request }) => {
    const body = (await request.json()) as { categoryIds?: string[] };
    if (!body.categoryIds?.length) {
      return HttpResponse.json({ title: "Categories required", status: 400 }, { status: 400 });
    }
    return HttpResponse.json(
      lobbyWithGuest({ id: String(params.lobbyId), selectedCategoryIds: body.categoryIds, setupVersion: 1 }),
    );
  }),
  http.put("**/api/lobbies/:lobbyId/setup/color", async ({ params, request }) => {
    const body = (await request.json()) as { pieceColor?: string };
    if (body.pieceColor === "Red") {
      return HttpResponse.json({ title: "Color unavailable", status: 409 }, { status: 409 });
    }
    return HttpResponse.json(
      lobbyWithGuest({
        id: String(params.lobbyId),
        players: [
          {
            userId: "user-1",
            username: "Alice",
            joinedAtUtc: "2026-06-16T10:00:00.000Z",
            selectedPieceColor: body.pieceColor as never,
            isReady: false,
          },
          { userId: "user-2", username: "Bob", joinedAtUtc: "2026-06-16T10:01:00.000Z", selectedPieceColor: null, isReady: false },
        ],
        setupVersion: 1,
      }),
    );
  }),
  http.put("**/api/lobbies/:lobbyId/setup/ready", async ({ params, request }) => {
    const body = (await request.json()) as { isReady?: boolean; setupVersion?: number };
    if (body.setupVersion === 99) {
      return HttpResponse.json({ title: "Stale setup", code: "matchmaking.setup.stale-version", status: 409 }, { status: 409 });
    }
    return HttpResponse.json(
      lobbyWithGuest({
        id: String(params.lobbyId),
        players: [
          {
            userId: "user-1",
            username: "Alice",
            joinedAtUtc: "2026-06-16T10:00:00.000Z",
            selectedPieceColor: "Blue",
            isReady: Boolean(body.isReady),
          },
          { userId: "user-2", username: "Bob", joinedAtUtc: "2026-06-16T10:01:00.000Z", selectedPieceColor: null, isReady: false },
        ],
        setupVersion: (body.setupVersion ?? 0) + 1,
      }),
    );
  }),
  http.post("**/api/lobbies/:lobbyId/start", () => HttpResponse.json(startLobbyResultFixture())),
];
