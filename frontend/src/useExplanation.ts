import { useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import type { Entry } from "@crosswordcoach/common";
import { explanationAtom } from "./state";

export function useExplanation(currentEntry: Entry | null) {
  const setExplanation = useSetAtom(explanationAtom);

  /* Reset explanation when entry changes */
  useEffect(() => {
    setExplanation(null);
  }, [currentEntry, setExplanation]);

  const showOrFetchExplanation = useCallback(async () => {
    if (!currentEntry) return;

    if (currentEntry.explanation) {
      setExplanation(currentEntry.explanation);
    } else {
      setExplanation("Here's the fetched explanation");
    }
  }, [currentEntry, setExplanation]);

  return { showOrFetchExplanation };
}
