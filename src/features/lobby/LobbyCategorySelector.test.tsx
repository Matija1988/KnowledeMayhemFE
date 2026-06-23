import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { lobbyWithGuest } from "../../tests/fixtures/lobbyFixtures";
import { adminToken } from "../../tests/fixtures/questionBankFixtures";
import { LobbyCategorySelector } from "./LobbyCategorySelector";

describe("LobbyCategorySelector", () => {
  it("lets hosts edit active category selection", async () => {
    useAuthStore.getState().login(adminToken);

    render(<LobbyCategorySelector lobby={lobbyWithGuest()} currentUserId="user-1" />, { wrapper: MemoryRouter });

    expect(await screen.findByLabelText("C#")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Save categories" })).toBeDisabled();
  });

  it("renders category setup read-only for non-host players", async () => {
    useAuthStore.getState().login(adminToken);

    render(<LobbyCategorySelector lobby={lobbyWithGuest({ selectedCategoryIds: ["10000000-0000-0000-0000-000000000001"] })} currentUserId="user-2" />, {
      wrapper: MemoryRouter,
    });

    expect(await screen.findByLabelText("C#")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save categories" })).not.toBeInTheDocument();
    expect(screen.getByText("Selected: C#")).toBeInTheDocument();
  });
});
