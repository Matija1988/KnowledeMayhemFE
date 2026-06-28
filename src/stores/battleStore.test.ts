import { describe, expect, it } from "vitest";
import { battleQuestionFixture, battleResultFixture } from "../tests/fixtures/battleFixtures";
import { resetBattleStoreForTests, selectHasPendingBattle, useBattleStore } from "./battleStore";

describe("battleStore", () => {
  it("tracks pending question and actor-only selection", () => {
    resetBattleStoreForTests();
    useBattleStore.getState().receiveQuestion(battleQuestionFixture());

    expect(selectHasPendingBattle(useBattleStore.getState())).toBe(true);
    useBattleStore.getState().selectAnswer("answer-1", "player-2");
    expect(useBattleStore.getState().selectedAnswerId).toBeNull();
    useBattleStore.getState().selectAnswer("answer-1", "player-1");
    expect(useBattleStore.getState().selectedAnswerId).toBe("answer-1");
  });

  it("deduplicates resolved attempts and stale sequences", () => {
    resetBattleStoreForTests();
    const result = battleResultFixture();

    expect(useBattleStore.getState().applyResult(result)).toBe(true);
    expect(useBattleStore.getState().applyResult(result)).toBe(false);
    expect(useBattleStore.getState().applyResult(battleResultFixture({ attemptId: "battle-2", sequence: 1 }))).toBe(false);
  });

  it("clears an expired question after authoritative state refresh", () => {
    resetBattleStoreForTests();
    useBattleStore.getState().receiveQuestion(battleQuestionFixture({ attemptKind: "SpecialField" }));
    useBattleStore.getState().expirePending();

    useBattleStore.getState().clearExpiredAttempt();

    expect(useBattleStore.getState().question).toBeNull();
    expect(useBattleStore.getState().expiredPending).toBe(false);
    expect(selectHasPendingBattle(useBattleStore.getState())).toBe(false);
  });
});
