import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { GameSessionPage } from "./GameSessionPage";
import { useGameStore } from "../../stores/gameStore";
import { useBattleStore } from "../../stores/battleStore";
import { battleQuestionFixture } from "../../tests/fixtures/battleFixtures";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { server } from "../../tests/setup";
import { ToastProvider } from "../../components/ToastProvider";
import { ErrorModal } from "../../components/ErrorModal";

describe("GameSessionPage", () => {
  it("loads and renders session status", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    renderGamePage("/game/session-1");

    expect(screen.getByText(/loading game/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText(/turn 1/i).length).toBeGreaterThan(0));
    expect(screen.getByRole("grid", { name: /game board/i })).toBeInTheDocument();
    const playersPanel = screen.getByRole("heading", { name: "Players" }).closest("aside");
    const categoriesPanel = screen.getByRole("heading", { name: "Categories" }).closest("aside");
    expect(playersPanel?.nextElementSibling).toBe(categoriesPanel);
  });

  it("shows a blocking error for malformed snapshots", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    renderGamePage("/game/malformed");

    await waitFor(() => expect(screen.getByRole("alertdialog")).toHaveTextContent(/could not be loaded safely/i));
  });

  it("shows reconnect state and disables movement while refresh is pending", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    renderGamePage("/game/session-1");
    await waitFor(() => expect(screen.getAllByText(/turn 1/i).length).toBeGreaterThan(0));

    act(() => {
      useGameStore.getState().setConnection({ status: "reconnecting" });
      useGameStore.getState().requestSnapshotRefresh();
    });

    await waitFor(() => expect(screen.getByText(/connection: reconnecting/i)).toBeInTheDocument());
  });

  it("starts a conquest question from board target selection without moving immediately", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().login(createJwt("user-1"));

    renderGamePage("/game/session-1");
    await waitFor(() => expect(screen.getAllByText(/turn 1/i).length).toBeGreaterThan(0));

    await user.click(screen.getByRole("gridcell", { name: /row 1 column 1/i }));
    await user.click(screen.getByRole("gridcell", { name: /row 1 column 2/i }));

    expect(await screen.findByRole("dialog", { name: /conquest question/i })).toBeInTheDocument();
    expect(screen.getByText(/which answer conquers this tile/i)).toBeInTheDocument();
    expect(useGameStore.getState().piecesById["piece-1"].currentTileId).toBe("tile-0-0");
  });

  it("renders battle question state and pauses board interaction while pending", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    renderGamePage("/game/session-1");
    await waitFor(() => expect(screen.getAllByText(/turn 1/i).length).toBeGreaterThan(0));

    act(() => useBattleStore.getState().receiveQuestion(battleQuestionFixture()));

    expect(await screen.findByRole("dialog", { name: /battle question/i })).toBeInTheDocument();
    expect(screen.getByText(/enemy battle attempt pending/i)).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell").every((cell) => cell.getAttribute("aria-disabled") === "true")).toBe(true);
  });

  it("opens the result screen when a 1v1 game completes", async () => {
    useAuthStore.getState().login(createJwt("user-2"));
    server.use(
      http.get("**/api/game-sessions/forfeit-win", () =>
        HttpResponse.json(
          gameSessionFixture({
            id: "forfeit-win",
            status: "Completed",
            currentTurnPlayerId: null,
            winnerPlayerId: "player-2",
            endedAtUtc: "2026-06-16T10:30:00.000Z",
            players: [
              { ...gameSessionFixture({ id: "forfeit-win" }).players[0], isEliminated: true, eliminatedAtUtc: "2026-06-16T10:30:00.000Z", eliminationReason: "Forfeit" },
              gameSessionFixture({ id: "forfeit-win" }).players[1],
            ],
            pieces: gameSessionFixture({ id: "forfeit-win" }).pieces.map((piece) =>
              piece.ownerPlayerId === "player-1" ? { ...piece, isCaptured: true, currentTileId: null } : piece,
            ),
          }),
        ),
      ),
    );

    renderGamePage("/game/forfeit-win");

    expect(await screen.findByText("Result route")).toBeInTheDocument();
  });

  it("lets players return to lobby from a cancelled game blocking state", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().login(createJwt("user-1"));

    renderGamePage("/game/cancelled");

    await user.click(await screen.findByRole("button", { name: /return to lobby/i }));

    expect(screen.getByText("Lobby route")).toBeInTheDocument();
  });
});

function renderGamePage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/game/:sessionId" element={<GameSessionPage />} />
        <Route path="/game/:sessionId/result" element={<p>Result route</p>} />
        <Route path="/lobby" element={<p>Lobby route</p>} />
      </Routes>
      <ToastProvider />
      <ErrorModal />
    </MemoryRouter>,
  );
}

function createJwt(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=/g, "");
  const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, "");
  return `${header}.${payload}.`;
}
