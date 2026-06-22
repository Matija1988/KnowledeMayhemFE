import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { specialFieldQuestionFixture } from "../../tests/fixtures/battleFixtures";
import { SpecialFieldQuestionModal } from "./SpecialFieldQuestionModal";

describe("SpecialFieldQuestionModal", () => {
  it("reuses the battle question modal for exactly three-answer special field attempts", () => {
    render(
      <SpecialFieldQuestionModal
        question={specialFieldQuestionFixture()}
        result={null}
        selectedAnswerId={null}
        pendingAnswer={false}
        expiredPending
        blockingError={null}
        actingPlayerId="player-1"
        liveMessage="Special field question expired."
        onSelectAnswer={vi.fn()}
        onSubmitAnswer={vi.fn()}
        onExpired={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: /special field question/i })).toBeInTheDocument();
    expect(screen.getAllByRole("status").some((status) => /progress: 0 \/ 3/i.test(status.textContent ?? ""))).toBe(true);
    expect(screen.getAllByText(/question expired/i).length).toBeGreaterThan(0);
  });
});
