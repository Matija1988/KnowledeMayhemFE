import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { conquestResultFixture, gameplayQuestionFixture } from "../tests/fixtures/conquestFixtures";
import { resetConquestStoreForTests, selectHasPendingConquest, useConquestStore } from "./conquestStore";

describe("conquestStore", () => {
  beforeEach(() => resetConquestStoreForTests());

  it("tracks active questions, selected answers, and pending state", () => {
    act(() => {
      useConquestStore.getState().beginAttempt();
      useConquestStore.getState().receiveQuestion(gameplayQuestionFixture());
      useConquestStore.getState().selectAnswer("answer-1", "player-1");
      useConquestStore.getState().beginAnswer();
    });

    expect(useConquestStore.getState().selectedAnswerId).toBe("answer-1");
    expect(useConquestStore.getState().pendingAnswer).toBe(true);
    expect(selectHasPendingConquest(useConquestStore.getState())).toBe(true);
  });

  it("prevents non-acting answer selection and duplicate result feedback", () => {
    act(() => {
      useConquestStore.getState().receiveQuestion(gameplayQuestionFixture());
      useConquestStore.getState().selectAnswer("answer-1", "player-2");
    });

    expect(useConquestStore.getState().selectedAnswerId).toBeNull();

    let first = false;
    let second = true;
    act(() => {
      first = useConquestStore.getState().applyResult(conquestResultFixture(), new Date("2026-06-17T10:00:00.000Z"));
      second = useConquestStore.getState().applyResult(conquestResultFixture(), new Date("2026-06-17T10:00:01.000Z"));
    });

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(useConquestStore.getState().lastResult?.questionAttemptId).toBe("attempt-1");
  });

  it("enters expired pending state until an authoritative result arrives", () => {
    act(() => {
      useConquestStore.getState().receiveQuestion(gameplayQuestionFixture());
      useConquestStore.getState().expirePending();
    });

    expect(useConquestStore.getState().expiredPending).toBe(true);
    expect(useConquestStore.getState().selectedAnswerId).toBeNull();
  });
});

