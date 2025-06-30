import type React from "react";
import { useScore } from "../score";

const ScoreDisplay: React.FC = () => {
  const { streak, correctScore, totalScore, accuracy } = useScore();
  let displayAccuracy = "0";
  if (accuracy !== 0) {
    displayAccuracy = Number.isInteger(accuracy) ? accuracy.toString() : accuracy.toFixed(2);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-3xl">
        Correct / Total: {correctScore} / {totalScore} ({displayAccuracy}%)
      </div>
      <div className="text-3xl">Streak: {streak}</div>
    </div>
  );
};

export default ScoreDisplay;
