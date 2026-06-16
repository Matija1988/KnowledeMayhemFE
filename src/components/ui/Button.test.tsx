import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("supports loading and accessible labels", () => {
    render(
      <Button aria-label="Create lobby" isLoading>
        Create
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Create lobby" })).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
});
