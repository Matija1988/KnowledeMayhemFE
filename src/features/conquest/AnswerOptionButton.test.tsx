import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnswerOptionButton } from "./AnswerOptionButton";

describe("AnswerOptionButton", () => {
  it("marks selected state accessibly and reports selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<AnswerOptionButton option={{ id: "answer-1", text: "Alpha" }} selected={true} disabled={false} onSelect={onSelect} />);

    const button = screen.getByRole("button", { name: /alpha.*selected/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
    await user.click(button);
    expect(onSelect).toHaveBeenCalledWith("answer-1");
  });

  it("does not report selection when disabled", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<AnswerOptionButton option={{ id: "answer-1", text: "Alpha" }} selected={false} disabled={true} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /alpha/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
