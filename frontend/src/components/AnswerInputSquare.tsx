import type React from "react";

const AnswerInputSquare: React.FC<AnswerInputSquareProps> = ({
  value,
  selected,
  answer,
  hoverable,
  revealed,
  jumping,
  className,
  onSelect,
}) => {
  return (
    <div
      className={`border-secondary flex aspect-square items-center justify-center border-2 font-bold transition-transform duration-150 ease-in-out select-none ${hoverable ? "hover:bg-primary hover:scale-120 hover:border-3" : ""} ${selected && !revealed ? "bg-primary text-primary-content" : "bg-base-100"} ${jumping ? "animate-jump" : ""} ${revealed ? "bg-secondary text-secondary-content hover:bg-secondary" : ""} ${className} `}
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
  hoverable: boolean;
  revealed: boolean;
  jumping: boolean;
  className: string;
  onSelect?: () => void;
}

export default AnswerInputSquare;
