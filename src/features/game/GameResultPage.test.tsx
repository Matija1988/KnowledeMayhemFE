import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { GameResultPage } from "./GameResultPage";

describe("GameResultPage", () => {
  it("shows victory and category statistics for both players", async () => {
    useAuthStore.getState().login(createJwt("user-1"));

    renderResultPage();

    expect(await screen.findByRole("heading", { name: "Victory!" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alice" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bob" })).toBeInTheDocument();
    expect(screen.getAllByRole("rowheader", { name: "C#" })).toHaveLength(2);
    expect(screen.getByText("5 of 10")).toBeInTheDocument();
    expect(screen.getAllByText("50%").length).toBeGreaterThan(0);
    expect(screen.getByText("3 of 8")).toBeInTheDocument();
  });

  it("shows game lost to the defeated player and returns to lobby", async () => {
    const user = userEvent.setup();
    useAuthStore.getState().login(createJwt("user-2"));

    renderResultPage();

    expect(await screen.findByRole("heading", { name: /game lost/i })).toBeInTheDocument();
    expect(screen.getByText(/alice won this game/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /return to lobby/i }));
    expect(screen.getByText("Lobby route")).toBeInTheDocument();
  });
});

function renderResultPage() {
  return render(
    <MemoryRouter initialEntries={["/game/completed/result"]}>
      <Routes>
        <Route path="/game/:sessionId/result" element={<GameResultPage />} />
        <Route path="/lobby" element={<p>Lobby route</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function createJwt(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=/g, "");
  const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, "");
  return `${header}.${payload}.`;
}
