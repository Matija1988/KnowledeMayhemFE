import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useErrorStore } from "../stores/errorStore";
import { ErrorModal } from "./ErrorModal";

describe("ErrorModal", () => {
  it("shows blocking errors and closes with Escape", async () => {
    useErrorStore
      .getState()
      .showError({ title: "Lobby closed", message: "Lost access to lobby.", displayMode: "modal" });
    render(<ErrorModal />);

    expect(screen.getByRole("dialog", { name: "Lobby closed" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Lobby closed" })).not.toBeInTheDocument();
  });
});
