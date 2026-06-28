import { useEffect, useRef } from "react";
import type { BattleQuestion, BattleResult } from "../../domain/battle/battleTypes";
import { QuestionTimer } from "../conquest/QuestionTimer";
import { BattleAnswerOptionButton } from "./BattleAnswerOptionButton";
import { BattleProgressPanel } from "./BattleProgressPanel";
import { BattleResultBanner } from "./BattleResultBanner";

type BattleQuestionModalProps = {
  question: BattleQuestion | null;
  result: BattleResult | null;
  selectedAnswerId: string | null;
  pendingAnswer: boolean;
  expiredPending: boolean;
  blockingError: string | null;
  actingPlayerId: string | null;
  liveMessage: string;
  onSelectAnswer: (answerId: string) => void;
  onSubmitAnswer: () => void;
  onExpired: () => void;
};

export function BattleQuestionModal({
  question,
  result,
  selectedAnswerId,
  pendingAnswer,
  expiredPending,
  blockingError,
  actingPlayerId,
  liveMessage,
  onSelectAnswer,
  onSubmitAnswer,
  onExpired,
}: BattleQuestionModalProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (question || result || blockingError) {
      titleRef.current?.focus();
    }
  }, [blockingError, question, result]);

  if (!question && !result && !blockingError) {
    return null;
  }

  const canAnswer = Boolean(question && question.actingPlayerId === actingPlayerId && !pendingAnswer && !expiredPending && !result && !blockingError);
  const submitDisabled = !canAnswer || !selectedAnswerId;
  const title = result ? "Battle result" : question?.attemptKind === "SpecialField" ? "Special field question" : "Battle question";

  return (
    <div className="ui-modal-backdrop conquest-modal-backdrop">
      <section className="ui-modal conquest-modal" role="dialog" aria-modal="true" aria-labelledby="battle-question-title">
        <h2 id="battle-question-title" ref={titleRef} tabIndex={-1}>
          {title}
        </h2>
        {blockingError ? (
          <div role="alert" className="conquest-blocking-error">
            {blockingError}
          </div>
        ) : null}
        {result ? <BattleResultBanner result={result} /> : null}
        {question && !result ? (
          <>
            <p className="conquest-category">{question.categoryName ?? question.categoryId}</p>
            <p className="conquest-question">{question.questionText}</p>
            <BattleProgressPanel question={question} expiredPending={expiredPending} />
            <QuestionTimer expiresAtUtc={question.expiresAtUtc} disabled={Boolean(result) || pendingAnswer} onExpired={onExpired} />
            <div role="group" aria-label="Answer options" className="conquest-answer-grid">
              {question.answerOptions.map((option) => (
                <BattleAnswerOptionButton
                  key={option.id}
                  option={option}
                  selected={option.id === selectedAnswerId}
                  disabled={!canAnswer}
                  onSelect={onSelectAnswer}
                />
              ))}
            </div>
            {question.actingPlayerId !== actingPlayerId ? (
              <p className="conquest-readonly">Another player is answering this question.</p>
            ) : null}
            <button type="button" className="ui-button ui-button--primary" disabled={submitDisabled} onClick={onSubmitAnswer}>
              {pendingAnswer ? "Submitting..." : "Submit"}
            </button>
          </>
        ) : null}
        <p className="sr-only" role="status" aria-live="polite">
          {liveMessage}
        </p>
      </section>
    </div>
  );
}
