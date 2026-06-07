import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LoginForm } from "./LoginForm";
import { ToastProvider } from "../../components/ToastProvider";
import { useAuthStore } from "../../stores/authStore";

function renderForm() {
  render(
    <MemoryRouter>
      <LoginForm />
      <ToastProvider />
    </MemoryRouter>,
  );
}

describe("LoginForm", () => {
  it("shows required-field validation before submitting", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(screen.getByText("Enter your username or email.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
  });

  it("signs in with valid credentials", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/username or email/i), "alice");
    await user.type(screen.getByLabelText(/password/i), "P@ssword123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
  });

  it("shows non-technical failures and keeps fields editable", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/username or email/i), "alice");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid username/email or password.")).toBeInTheDocument();
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), "P@ssword123!");
    expect(screen.getByLabelText(/password/i)).toHaveValue("P@ssword123!");
  });

  it("supports keyboard labels, focus, and loading announcements", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.tab();
    expect(screen.getByLabelText(/username or email/i)).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText(/password/i)).toHaveFocus();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
