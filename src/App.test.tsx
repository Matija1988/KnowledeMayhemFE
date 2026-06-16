import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { useAuthStore } from "./stores/authStore";

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
});

function createJwt(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=/g, "");
  const payload = btoa(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=/g, "");
  return `${header}.${payload}.`;
}
