import type React from "react";

const AnswerInputSquare: React.FC<AnswerInputSquareProps> = ({
  value,
  selected,
  answer,
  revealed,
  jumping,
  className,
  onSelect,
}) => {
  return (
    <div
      className={`answer-square hover:bg-primary flex items-center justify-center text-4xl text-[clamp(1.5rem,5vw,3rem)] font-bold transition-transform duration-150 ease-in-out select-none hover:scale-120 hover:border-3 ${selected && !revealed ? "bg-primary text-primary-content" : "bg-base-100"} ${jumping ? "animate-jump" : ""} ${revealed ? "bg-secondary text-secondary-content" : ""} ${className} `}
      onClick={onSelect}
      tabIndex={0}
      role="button"
      aria-label={revealed ? answer : value}
    >
      {revealed ? answer : value}
    </div>
  );
};

interface AnswerInputSquareProps {
  value: string;
  selected: boolean;
  answer: string;
  revealed: boolean;
  jumping: boolean;
  className: string;
  onSelect?: () => void;
}

export default AnswerInputSquare;
