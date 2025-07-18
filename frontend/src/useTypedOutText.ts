import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to "type out" text one character at a time, like a typing animation.
 * @param text The full text to type out
 * @param speed Typing speed in ms per character (default: 30)
 * @returns The currently displayed text
 */
export function useTypedOutText(text: string, speed: number = 30): string {
  const [displayed, setDisplayed] = useState("");
  const iRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayed("");
    iRef.current = 0;
    if (!text) return;

    intervalRef.current = setInterval(() => {
      iRef.current += 1;
      setDisplayed(text.slice(0, iRef.current));
      if (iRef.current >= text.length && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed]);

  return displayed;
}
