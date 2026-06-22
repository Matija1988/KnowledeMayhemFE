import type { BattleAnswerOption } from "../../domain/battle/battleTypes";

type BattleAnswerOptionButtonProps = {
  option: BattleAnswerOption;
  selected: boolean;
  disabled: boolean;
  onSelect: (answerId: string) => void;
};

export function BattleAnswerOptionButton({ option, selected, disabled, onSelect }: BattleAnswerOptionButtonProps) {
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
