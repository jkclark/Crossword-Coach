import type React from "react";
import { useScore } from "../score";

const ScoreDisplay: React.FC = () => {
  const { streak } = useScore();

  return <div className="text-3xl">Streak: {streak}</div>;
};

export default ScoreDisplay;
