import type React from "react";

const AnswerInputSquare: React.FC<AnswerInputSquareProps> = ({ value, selected }) => {
  return (
    <div
      className={`
        flex items-center justify-center
        text-4xl font-bold
        border border-black
        aspect-square
        min-w-[3rem] min-h-[3rem]
        select-none
        ${selected ? "bg-primary" : ""}
      `}
    >
      {value}
    </div>
  );
};

interface AnswerInputSquareProps {
  value: string;
  selected: boolean;
}

export default AnswerInputSquare;
