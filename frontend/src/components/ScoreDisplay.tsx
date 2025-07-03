import type React from "react";
import { useScore } from "../useScore";

const ScoreDisplay: React.FC = () => {
  const { streak, correctScore, totalScore, accuracy } = useScore();
  let displayAccuracy = "-";
  if (accuracy !== null) {
    displayAccuracy = Number.isInteger(accuracy)
      ? accuracy.toString() + "%"
      : accuracy.toFixed(2) + "%";
  }

  return (
    <div className="absolute overflow-x-auto">
      <table className="table">
        <tbody>
          <tr>
            <td>Total</td>
            <td className="text-right">{totalScore}</td>
          </tr>
          <tr>
            <td>Correct</td>
            <td className="text-right">{correctScore}</td>
          </tr>
          <tr>
            <td>Accuracy</td>
            <td className="text-right">{displayAccuracy}</td>
          </tr>
          <tr>
            <td>Streak</td>
            <td className="text-right">{streak}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScoreDisplay;
