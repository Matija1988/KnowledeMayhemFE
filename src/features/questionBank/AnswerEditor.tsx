import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";

type AnswerEditorProps = {
  answers: Array<{ text: string; isCorrect: boolean }>;
  errors?: Partial<Record<`answer-${number}` | "answers", string>>;
  onChange: (answers: Array<{ text: string; isCorrect: boolean }>) => void;
};

export function AnswerEditor({ answers, errors = {}, onChange }: AnswerEditorProps) {
  const fixedAnswers = answers.slice(0, 4);
  while (fixedAnswers.length < 4) {
    fixedAnswers.push({ text: "", isCorrect: false });
  }

  function updateAnswer(index: number, text: string) {
    onChange(fixedAnswers.map((answer, answerIndex) => (answerIndex === index ? { ...answer, text } : answer)));
  }

  function chooseCorrect(index: number) {
    onChange(fixedAnswers.map((answer, answerIndex) => ({ ...answer, isCorrect: answerIndex === index })));
  }

  return (
    <fieldset className="answer-editor">
      <legend>Answers</legend>
      {errors.answers ? (
        <p id="answers-error" className="ui-field-error" role="alert">
          {errors.answers}
        </p>
      ) : null}
      {fixedAnswers.map((answer, index) => {
        const id = `answer-${index}`;
        const error = errors[id as `answer-${number}`];
        return (
          <div className="answer-editor-row" key={id}>
            <label className="answer-editor-correct">
              <input
                type="radio"
                name="correct-answer"
                checked={answer.isCorrect}
                onChange={() => chooseCorrect(index)}
              />
              Correct
            </label>
            <FormField id={id} label={`Answer ${index + 1}`} error={error}>
              <Input
                id={id}
                value={answer.text}
                maxLength={1000}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(event) => updateAnswer(index, event.target.value)}
              />
            </FormField>
          </div>
        );
      })}
    </fieldset>
  );
}
