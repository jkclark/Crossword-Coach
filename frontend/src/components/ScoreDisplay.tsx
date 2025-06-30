import type React from "react";
import { useScore } from "../score";

const ScoreDisplay: React.FC = () => {
  const { score } = useScore();

  return <div className="text-3xl">Score: {score}</div>;
};

export default ScoreDisplay;
