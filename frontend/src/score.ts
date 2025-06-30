import { useAtom } from "jotai";
import { streakAtom } from "./state";

export function useScore() {
  const [streak, setStreak] = useAtom(streakAtom);

  const resetStreak = () => setStreak(0);

  return { streak, setStreak, resetStreak };
}
