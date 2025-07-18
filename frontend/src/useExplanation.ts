import { useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";

import type { Entry } from "@crosswordcoach/common";
import { explanationAtom, isExplanationLoadingAtom } from "./state";

export function useExplanation(currentEntry: Entry | null) {
  const setExplanation = useSetAtom(explanationAtom);
  const setIsExplanationLoading = useSetAtom(isExplanationLoadingAtom);

  /* Reset explanation when entry changes */
  useEffect(() => {
    setExplanation(null);
  }, [currentEntry, setExplanation]);

  const showOrFetchExplanation = useCallback(async () => {
    if (!currentEntry) return;

    setIsExplanationLoading(true);

    if (currentEntry.explanation) {
      setExplanation(currentEntry.explanation);
    } else {
      setExplanation("Here's the fetched explanation");
    }

    /* A short delay is required to ensure state is set to true
     * and then false separately, otherwise the UI may not update correctly.
     */
    setTimeout(() => {
      setIsExplanationLoading(false);
    }, 50);
  }, [currentEntry, setExplanation, setIsExplanationLoading]);

  return { showOrFetchExplanation };
}
