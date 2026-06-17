import type { GameplayAnswerOption } from "../../domain/conquest/conquestTypes";

type AnswerOptionButtonProps = {
  option: GameplayAnswerOption;
  selected: boolean;
  disabled: boolean;
  onSelect: (answerId: string) => void;
};

export function AnswerOptionButton({ option, selected, disabled, onSelect }: AnswerOptionButtonProps) {
  return (
    <button
      type="button"
      className={`conquest-answer${selected ? " conquest-answer--selected" : ""}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(option.id)}
    >
      <span>{option.text}</span>
      {selected ? <span className="conquest-answer__state">Selected</span> : null}
    </button>
  );
}

