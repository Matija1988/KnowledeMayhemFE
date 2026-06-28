import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { conquestResultFixture, gameplayQuestionFixture } from "../../tests/fixtures/conquestFixtures";
import { QuestionModal } from "./QuestionModal";

describe("QuestionModal", () => {
  it("shows the countdown supplied for a normal-field question", () => {
    const now = new Date("2026-06-28T12:00:00.000Z").getTime();
    const dateNow = vi.spyOn(Date, "now").mockReturnValue(now);

    render(
      <QuestionModal
        question={gameplayQuestionFixture({ expiresAtUtc: new Date(now + 30_000).toISOString() })}
        result={null}
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

    expect(screen.getByText("Time remaining: 30s")).toBeInTheDocument();
    dateNow.mockRestore();
  });

  it("shows exactly four options and submits only after explicit confirmation", async () => {
    const user = userEvent.setup();
    const onSelectAnswer = vi.fn();
    const onSubmitAnswer = vi.fn();

    render(
      <QuestionModal
        question={gameplayQuestionFixture()}
        result={null}
        selectedAnswerId="answer-1"
        pendingAnswer={false}
        expiredPending={false}
        blockingError={null}
        actingPlayerId="player-1"
        liveMessage=""
        onSelectAnswer={onSelectAnswer}
        onSubmitAnswer={onSubmitAnswer}
        onExpired={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: /alpha|beta|gamma|delta/i })).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: /beta/i }));
    expect(onSelectAnswer).toHaveBeenCalledWith("answer-2");
    expect(onSubmitAnswer).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmitAnswer).toHaveBeenCalledTimes(1);
  });

  it("renders non-acting and expired states as non-interactive", () => {
    render(
      <QuestionModal
        question={gameplayQuestionFixture()}
        result={null}
        selectedAnswerId={null}
        pendingAnswer={false}
        expiredPending
        blockingError={null}
        actingPlayerId="player-2"
        liveMessage="Question expired."
        onSelectAnswer={vi.fn()}
        onSubmitAnswer={vi.fn()}
        onExpired={vi.fn()}
      />,
    );

    expect(screen.getByText(/another player/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("shows result feedback", () => {
    render(
      <QuestionModal
        question={null}
        result={conquestResultFixture()}
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

    expect(screen.getAllByRole("status")[0]).toHaveTextContent(/correct/i);
  });
});
