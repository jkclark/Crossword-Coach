import { useEffect, useRef, useState } from "react";

/**
 * The idea is to show a loading state for at least a minimum duration.
 */
export function useMinimumLoading(isLoading: boolean, minDurationMs: number = 1000): boolean {
  const [showLoading, setShowLoading] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      startTimeRef.current = Date.now();
    } else if (showLoading && startTimeRef.current) {
      /* Determine the amount of time remaining to meet the minimum duration */
      const remainingTime = minDurationMs - (Date.now() - startTimeRef.current);

      /* If there's still time left, set a timer to show loading until then */
      if (remainingTime > 0) {
        timerRef.current = setTimeout(() => {
          setShowLoading(false);
          startTimeRef.current = null;
        }, remainingTime);
      } else {
        /* If the minimum duration has already passed, hide the loading state immediately */
        setShowLoading(false);
        startTimeRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, minDurationMs, showLoading]);

  return showLoading;
}
