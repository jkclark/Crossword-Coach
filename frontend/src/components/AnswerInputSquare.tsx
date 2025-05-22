import { useAtomValue } from "jotai";
import type React from "react";
import { userGaveUpAtom } from "../state";

const AnswerInputSquare: React.FC<AnswerInputSquareProps> = ({ value, selected, answer, jumping }) => {
  const userGaveUp = useAtomValue(userGaveUpAtom);

  return (
    <div
      className={`
        flex items-center justify-center
        text-4xl font-bold
        border border-black
        aspect-square
        w-[clamp(2.5rem,8vw,4rem)] h-[clamp(2.5rem,8vw,4rem)]
        text-[clamp(1.5rem,5vw,3rem)]
        select-none
        ${selected && !userGaveUp ? "bg-primary" : ""}
        ${jumping ? "animate-jump" : ""}
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
  jumping: boolean;
}

export default AnswerInputSquare;
