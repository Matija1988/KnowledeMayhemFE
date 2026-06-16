import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useErrorStore } from "../stores/errorStore";
import { ToastProvider } from "./ToastProvider";

describe("ToastProvider", () => {
  it("shows and dismisses non-blocking errors", async () => {
    useErrorStore.getState().showError({ title: "Lobby problem", message: "Lobby not found.", displayMode: "toast" });
    render(<ToastProvider />);

    expect(screen.getByText("Lobby not found.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss message" }));
    expect(screen.queryByText("Lobby not found.")).not.toBeInTheDocument();
  });
});
