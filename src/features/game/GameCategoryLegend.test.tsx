import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { gameSessionFixture } from "../../tests/fixtures/gameFixtures";
import { GameCategoryLegend } from "./GameCategoryLegend";

describe("GameCategoryLegend", () => {
  it("shows only board categories with their configured colors", () => {
    render(
      <GameCategoryLegend
        session={gameSessionFixture()}
        categories={[
          {
            id: "cat-0",
            name: "C#",
            description: "C# questions",
            color: "#7C3AED",
            createdAtUtc: "2026-06-16T10:00:00.000Z",
            updatedAtUtc: null,
            isActive: true,
            deletedAtUtc: null,
          },
          {
            id: "cat-1",
            name: "Biology",
            description: "Biology questions",
            color: "#16A34A",
            createdAtUtc: "2026-06-16T10:00:00.000Z",
            updatedAtUtc: null,
            isActive: true,
            deletedAtUtc: null,
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getByText("C#").previousElementSibling).toHaveStyle({ backgroundColor: "#7C3AED" });
    expect(screen.getByText("Biology").previousElementSibling).toHaveStyle({ backgroundColor: "#16A34A" });
  });
});
