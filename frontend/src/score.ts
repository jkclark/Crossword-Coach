import { useAtom } from "jotai";
import { scoreAtom } from "./state";

export function useScore() {
  const [score, setScore] = useAtom(scoreAtom);

  const resetScore = () => setScore(0);

  return { score, setScore, resetScore };
}
