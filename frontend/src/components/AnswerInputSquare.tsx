import { useAtomValue } from "jotai";
import type React from "react";
import { userGaveUpAtom } from "../state";

const AnswerInputSquare: React.FC<AnswerInputSquareProps> = ({ value, selected, answer }) => {
  const userGaveUp = useAtomValue(userGaveUpAtom);

  return (
    <div
      className={`
        flex items-center justify-center
        text-4xl font-bold
        border border-black
        aspect-square
        min-w-[3rem] min-h-[3rem]
        select-none
        ${selected && !userGaveUp ? "bg-primary" : ""}
      `}
    >
      {userGaveUp ? answer : value}
    </div>
  );
};

interface AnswerInputSquareProps {
  value: string;
  selected: boolean;
  answer: string;
}

export default AnswerInputSquare;
