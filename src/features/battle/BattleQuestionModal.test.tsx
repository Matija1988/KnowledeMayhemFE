import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { battleQuestionFixture, battleResultFixture, specialFieldQuestionFixture } from "../../tests/fixtures/battleFixtures";
import { BattleQuestionModal } from "./BattleQuestionModal";

describe("BattleQuestionModal", () => {
  it("lets the acting player select and submit answers with keyboard-safe buttons", async () => {
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
        liveMessage="Battle question issued."
        onSelectAnswer={onSelectAnswer}
        onSubmitAnswer={onSubmitAnswer}
        onExpired={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: /battle question/i })).toBeInTheDocument();
    expect(screen.queryByText(/is correct/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /beta/i }));
    expect(onSelectAnswer).toHaveBeenCalledWith("answer-2");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmitAnswer).toHaveBeenCalledTimes(1);
  });

  it("keeps spectators read-only while still showing neutral question progress", () => {
    render(
      <BattleQuestionModal
        question={specialFieldQuestionFixture()}
        result={null}
        selectedAnswerId={null}
        pendingAnswer={false}
        expiredPending={false}
        blockingError={null}
        actingPlayerId="player-2"
        liveMessage=""
        onSelectAnswer={vi.fn()}
        onSubmitAnswer={vi.fn()}
        onExpired={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: /special field question/i })).toBeInTheDocument();
    expect(screen.getByText(/another player/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
    expect(screen.getAllByRole("status").some((status) => /progress: 0 \/ 3/i.test(status.textContent ?? ""))).toBe(true);
  });

  it("renders blocking errors and result state", () => {
    const { rerender } = render(
      <BattleQuestionModal
        question={null}
        result={null}
        selectedAnswerId={null}
        pendingAnswer={false}
        expiredPending={false}
        blockingError="Move unavailable."
        actingPlayerId="player-1"
        liveMessage=""
        onSelectAnswer={vi.fn()}
        onSubmitAnswer={vi.fn()}
        onExpired={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/move unavailable/i);

    rerender(
      <BattleQuestionModal
        question={null}
        result={battleResultFixture()}
        selectedAnswerId={null}
        pendingAnswer={false}
        expiredPending={false}
        blockingError={null}
        actingPlayerId="player-1"
        liveMessage=""
        onSelectAnswer={vi.fn()}
        onSubmitAnswer={vi.fn()}
        onExpired={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: /battle result/i })).toBeInTheDocument();
    expect(screen.getByText(/battle succeeded/i)).toBeInTheDocument();
  });
});
