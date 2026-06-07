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
});
