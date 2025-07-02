import { useAtom } from "jotai";
import { correctScoreAtom, streakAtom, totalScoreAtom } from "./state";

export function useScore() {
  const [streak, setStreak] = useAtom(streakAtom);
  const [correctScore, setCorrectScore] = useAtom(correctScoreAtom);
  const [totalScore, setTotalScore] = useAtom(totalScoreAtom);

  /* Derived state */
  const accuracy = totalScore > 0 ? (correctScore / totalScore) * 100 : null;

  const resetStreak = () => setStreak(0);

  return {
    streak,
    setStreak,
    resetStreak,
    correctScore,
    setCorrectScore,
    totalScore,
    setTotalScore,
    accuracy,
  };
}
