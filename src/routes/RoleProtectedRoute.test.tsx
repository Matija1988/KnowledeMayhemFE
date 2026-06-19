import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RoleProtectedRoute } from "./RoleProtectedRoute";
import { useAuthStore } from "../stores/authStore";
import { adminToken, moderatorToken, playerToken } from "../tests/fixtures/questionBankFixtures";

function renderRoute() {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/login" element={<p>Login</p>} />
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute>
              <p>Admin content</p>
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RoleProtectedRoute", () => {
  it("redirects unauthenticated users", () => {
    renderRoute();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("blocks players before management content renders", () => {
    useAuthStore.getState().login(playerToken);
    renderRoute();
    expect(screen.getByRole("heading", { name: /permission denied/i })).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("allows moderators and admins", () => {
    useAuthStore.getState().login(moderatorToken);
    renderRoute();
    expect(screen.getByText("Admin content")).toBeInTheDocument();
    useAuthStore.getState().login(adminToken);
  });
});
