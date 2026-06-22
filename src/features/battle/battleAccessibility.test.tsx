import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { battleQuestionFixture, specialFieldQuestionFixture } from "../../tests/fixtures/battleFixtures";
import { BattleQuestionModal } from "./BattleQuestionModal";

describe("battle accessibility", () => {
  it("supports keyboard-only battle answer selection and live region output", async () => {
    const user = userEvent.setup();
    const onSelectAnswer = vi.fn();
    const onSubmitAnswer = vi.fn();

    render(
      <BattleQuestionModal
        question={battleQuestionFixture()}
        result={null}
        selectedAnswerId="answer-1"
        pendingAnswer={false}
        expiredPending={false}
        blockingError={null}
        actingPlayerId="player-1"
        liveMessage="Battle question available. 0 of 2 correct."
        onSelectAnswer={onSelectAnswer}
        onSubmitAnswer={onSubmitAnswer}
        onExpired={vi.fn()}
      />,
    );

    await user.tab();
    await user.tab();
    await user.keyboard("[Enter]");
    expect(onSelectAnswer).toHaveBeenCalled();

    expect(screen.getAllByRole("status").some((status) => /battle question available/i.test(status.textContent ?? ""))).toBe(true);
    expect(screen.queryByText(/correct answer/i)).not.toBeInTheDocument();
  });

  it("announces special field progress and preserves spectator read-only controls", () => {
    render(
      <BattleQuestionModal
        question={specialFieldQuestionFixture()}
        result={null}
        selectedAnswerId={null}
        pendingAnswer={false}
        expiredPending={false}
        blockingError={null}
        actingPlayerId="player-2"
        liveMessage="Special field question available. 0 of 3 correct."
        onSelectAnswer={vi.fn()}
        onSubmitAnswer={vi.fn()}
        onExpired={vi.fn()}
      />,
    );

    expect(screen.getByText(/another player is answering/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
    expect(screen.getAllByRole("status").some((status) => /0 of 3 correct/i.test(status.textContent ?? ""))).toBe(true);
  });
});
