import type { BattleQuestion } from "../../domain/battle/battleTypes";

type BattleProgressPanelProps = {
  question: BattleQuestion;
  expiredPending: boolean;
};

export function BattleProgressPanel({ question, expiredPending }: BattleProgressPanelProps) {
  return (
    <div className="battle-progress" role="status" aria-live="polite">
      <p>
        Progress: {question.progress.correctAnswers} / {question.progress.requiredCorrectAnswers}
      </p>
      <p>{question.attemptKind === "Battle" ? "Enemy battle" : "Special field"} attempt pending.</p>
      {expiredPending ? <p>This question expired. Waiting for authoritative result.</p> : null}
    </div>
  );
}
