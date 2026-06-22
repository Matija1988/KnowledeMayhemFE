import { http, HttpResponse } from "msw";
import { battleQuestionFixture, battleResultFixture, specialFieldQuestionFixture } from "../fixtures/battleFixtures";

export const battleHandlers = [
  http.post("**/api/game-sessions/:gameSessionId/battle-attempts", () => {
    return HttpResponse.json(toBattleQuestionDto(battleQuestionFixture()));
  }),
  http.post("**/api/game-sessions/:gameSessionId/battle-attempts/:battleAttemptId/answers", () => {
    return HttpResponse.json(toBattleResultDto(battleResultFixture()));
  }),
  http.post("**/api/game-sessions/:gameSessionId/special-field-attempts", () => {
    return HttpResponse.json(toSpecialQuestionDto(specialFieldQuestionFixture()));
  }),
  http.post("**/api/game-sessions/:gameSessionId/special-field-attempts/:specialFieldAttemptId/answers", () => {
    return HttpResponse.json(
      toBattleResultDto(
        battleResultFixture({
          attemptKind: "SpecialField",
          attemptId: "special-1",
          capturedPieceId: null,
          status: "Succeeded",
        }),
      ),
    );
  }),
];

function toBattleQuestionDto(question: ReturnType<typeof battleQuestionFixture>) {
  return {
    battleAttemptId: question.attemptId,
    ...question,
    answerOptions: question.answerOptions.map((option) => ({ answerId: option.id, text: option.text })),
  };
}

function toSpecialQuestionDto(question: ReturnType<typeof specialFieldQuestionFixture>) {
  return {
    specialFieldAttemptId: question.attemptId,
    ...question,
    answerOptions: question.answerOptions.map((option) => ({ answerId: option.id, text: option.text })),
  };
}

function toBattleResultDto(result: ReturnType<typeof battleResultFixture>) {
  return {
    battleAttemptId: result.attemptKind === "Battle" ? result.attemptId : undefined,
    specialFieldAttemptId: result.attemptKind === "SpecialField" ? result.attemptId : undefined,
    status: result.status,
    reason: result.reason,
    gameSessionId: result.gameSessionId,
    movedPieceId: result.movedPieceId,
    capturedPieceId: result.capturedPieceId,
    leveledPieceId: result.leveledPieceId,
    newLevel: result.newLevel,
    sourceTileId: result.sourceTileId,
    targetTileId: result.targetTileId,
    targetOwnerPlayerId: result.targetOwnerPlayerId,
    nextTurnPlayerId: result.nextTurnPlayerId,
    turnNumber: result.turnNumber,
    sequence: result.sequence,
    session: result.session,
  };
}
