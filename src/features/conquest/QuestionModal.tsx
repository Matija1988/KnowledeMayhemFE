import { useEffect, useRef } from "react";
import type { ConquestResult, GameplayQuestion } from "../../domain/conquest/conquestTypes";
import { AnswerOptionButton } from "./AnswerOptionButton";
import { ConquestResultBanner } from "./ConquestResultBanner";
import { QuestionTimer } from "./QuestionTimer";

type QuestionModalProps = {
  question: GameplayQuestion | null;
  result: ConquestResult | null;
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

export function QuestionModal({
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
}: QuestionModalProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (question || result || blockingError) {
      titleRef.current?.focus();
    }
  }, [blockingError, question, result]);

  if (!question && !result && !blockingError) {
    return null;
  }

  const canAnswer = Boolean(question && question.playerId === actingPlayerId && !pendingAnswer && !expiredPending && !result && !blockingError);
  const submitDisabled = !canAnswer || !selectedAnswerId;

  return (
    <div className="ui-modal-backdrop conquest-modal-backdrop">
      <section className="ui-modal conquest-modal" role="dialog" aria-modal="true" aria-labelledby="conquest-question-title">
        <h2 id="conquest-question-title" ref={titleRef} tabIndex={-1}>
          {result ? "Conquest result" : "Conquest question"}
        </h2>
        {blockingError ? (
          <div role="alert" className="conquest-blocking-error">
            {blockingError}
          </div>
        ) : null}
        {result ? <ConquestResultBanner result={result} /> : null}
        {question && !result ? (
          <>
            <p className="conquest-category">{question.categoryName ?? question.categoryId}</p>
            <p className="conquest-question">{question.questionText}</p>
            <QuestionTimer expiresAtUtc={question.expiresAtUtc} disabled={Boolean(result)} onExpired={onExpired} />
            {expiredPending ? (
              <p role="status" className="conquest-expired">
                This question expired. Waiting for the game to resolve the attempt.
              </p>
            ) : null}
            <div role="group" aria-label="Answer options" className="conquest-answer-grid">
              {question.answerOptions.map((option) => (
                <AnswerOptionButton
                  key={option.id}
                  option={option}
                  selected={option.id === selectedAnswerId}
                  disabled={!canAnswer}
                  onSelect={onSelectAnswer}
                />
              ))}
            </div>
            {question.playerId !== actingPlayerId ? (
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

