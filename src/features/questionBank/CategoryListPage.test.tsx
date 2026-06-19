import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { adminToken, moderatorToken } from "../../tests/fixtures/questionBankFixtures";
import { CategoryListPage } from "./CategoryListPage";

describe("CategoryListPage", () => {
  it("shows admin controls and inactive badges", async () => {
    useAuthStore.getState().login(adminToken);
    render(
      <MemoryRouter>
        <CategoryListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("C#")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New category" })).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("keeps moderators read only", async () => {
    useAuthStore.getState().login(moderatorToken);
    render(
      <MemoryRouter>
        <CategoryListPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Read only")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New category" })).not.toBeInTheDocument();
  });
});
