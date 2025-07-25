import type React from "react";

const AnswerInputSquare: React.FC<AnswerInputSquareProps> = ({
  value,
  selected,
  answer,
  revealed,
  jumping,
  className,
}) => {
  return (
    <div
      className={`
        flex items-center justify-center
        text-4xl font-bold
        border-secondary
        aspect-square
        w-[clamp(2.5rem,8vw,4rem)] h-[clamp(2.5rem,8vw,4rem)]
        text-[clamp(1.5rem,5vw,3rem)]
        select-none
        ${selected && !revealed ? "bg-primary text-primary-content" : ""}
        ${jumping ? "animate-jump" : ""}
        ${revealed ? "bg-secondary text-secondary-content" : ""}
        ${className}
      `}
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
}

export default AnswerInputSquare;
