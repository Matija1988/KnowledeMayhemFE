import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { GameSessionPage } from "./GameSessionPage";
import { useGameStore } from "../../stores/gameStore";

describe("GameSessionPage", () => {
  it("loads and renders session status", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    renderGamePage("/game/session-1");

    expect(screen.getByText(/loading game/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByText(/turn 1/i).length).toBeGreaterThan(0));
    expect(screen.getByRole("grid", { name: /game board/i })).toBeInTheDocument();
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
});

function renderGamePage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/game/:sessionId" element={<GameSessionPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function createJwt(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=/g, "");
  const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, "");
  return `${header}.${payload}.`;
}
