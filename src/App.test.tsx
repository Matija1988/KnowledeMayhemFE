import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { useAuthStore } from "./stores/authStore";
import { adminToken, playerToken } from "./tests/fixtures/questionBankFixtures";

describe("App routes", () => {
  it("protects the game route", async () => {
    window.history.pushState({}, "", "/game/session-1");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the protected game route for authenticated users", async () => {
    useAuthStore.getState().login(createJwt("user-1"));
    window.history.pushState({}, "", "/game/session-1");

    render(<App />);

    expect(await screen.findByText(/game session/i)).toBeInTheDocument();
  });

  it("protects management routes by role", async () => {
    useAuthStore.getState().login(playerToken);
    window.history.pushState({}, "", "/admin/question-bank/questions");

    render(<App />);

    expect((await screen.findAllByRole("heading", { name: /permission denied/i })).length).toBeGreaterThan(0);
  });

  it("renders management routes for admins", async () => {
    useAuthStore.getState().login(adminToken);
    window.history.pushState({}, "", "/admin/question-bank");

    render(<App />);

    expect(await screen.findByRole("heading", { name: "Question bank" })).toBeInTheDocument();
  });
});

function createJwt(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=/g, "");
  const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, "");
  return `${header}.${payload}.`;
}
