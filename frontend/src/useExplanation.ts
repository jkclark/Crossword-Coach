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

  const fetchExplanation = useCallback(
    async (entry: Entry): Promise<string | null> => {
      const url = getExplanationURL();

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: getHeadersForExplanationRequest(),
          body: getBodyForExplanationRequest(entry),
        });
        const data = await response.json();
        return data.explanation;
      } catch (error) {
        console.error("Error fetching explanation:", error);
        return null;
      }
    },
    [],
  );

  const showOrFetchExplanation = useCallback(async () => {
    if (!currentEntry) return;

    setIsExplanationLoading(true);

    if (currentEntry.explanation) {
      setExplanation(currentEntry.explanation);
    } else {
      setExplanation(await fetchExplanation(currentEntry));
    }

    /* A short delay is required to ensure state is set to true
     * and then false separately, otherwise the UI may not update correctly.
     */
    setTimeout(() => {
      setIsExplanationLoading(false);
    }, 50);
  }, [currentEntry, setExplanation, setIsExplanationLoading, fetchExplanation]);

  function getExplanationURL() {
    return `${import.meta.env.VITE_BASE_API_URL}/explain`;
  }

  function getHeadersForExplanationRequest() {
    return {
      "Content-Type": "application/json",
    };
  }

  function getBodyForExplanationRequest(entry: Entry) {
    return JSON.stringify({ clue: entry.clue, answer: entry.answer });
  }

  return { showOrFetchExplanation };
}
