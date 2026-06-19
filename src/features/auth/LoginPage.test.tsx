import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("redirects signed-in users to the lobby entry point", () => {
    useAuthStore.getState().login("token");

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lobby" element={<p>Lobby page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Lobby page")).toBeInTheDocument();
  });

  it("redirects signed-in admins to question bank management", () => {
    useAuthStore.getState().login(jwtWithPayload({ role: "Admin" }));

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lobby" element={<p>Lobby page</p>} />
          <Route path="/admin/question-bank" element={<p>Question bank page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Question bank page")).toBeInTheDocument();
  });
});

function jwtWithPayload(payload: Record<string, unknown>): string {
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `header.${encodedPayload}.signature`;
}
