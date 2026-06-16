import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ToastProvider } from "../components/ToastProvider";
import { useAuthStore } from "../stores/authStore";
import { ProtectedRoute } from "./ProtectedRoute";

function renderProtected(initialEntry = "/protected") {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/lobby"
          element={
            <ProtectedRoute>
              <p>Lobby content</p>
            </ProtectedRoute>
          }
        />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <p>Protected content</p>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastProvider />
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("redirects logged-out users without showing protected content", () => {
    renderProtected();

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("allows signed-in users to see protected content", () => {
    useAuthStore.getState().login("token");
    renderProtected();

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("protects the lobby route", () => {
    renderProtected("/lobby");

    expect(screen.queryByText("Lobby content")).not.toBeInTheDocument();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("shows a prompt for invalid saved sessions", async () => {
    useAuthStore.getState().clearInvalidSession("invalid-saved-session");
    renderProtected();

    await waitFor(() => expect(screen.getByText("Please sign in again.")).toBeInTheDocument());
  });
});
