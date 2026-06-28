import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryForm } from "./CategoryForm";

describe("CategoryForm", () => {
  it("blocks invalid submissions and accepts valid values", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CategoryForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /create category/i }));
    expect(await screen.findByText("Enter a category name.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Name"), "C#");
    await user.type(screen.getByLabelText("Description"), "Language");
    await user.click(screen.getByRole("button", { name: /create category/i }));
    expect(onSubmit).toHaveBeenCalledWith({ name: "C#", description: "Language", color: "#3B82F6" });
  });
});
