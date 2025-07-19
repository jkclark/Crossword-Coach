import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

import type { Entry } from "@crosswordcoach/common";
import { explanationAtom, isExplanationLoadingAtom } from "./state";

export function useExplanation(currentEntry: Entry | null) {
  const setExplanation = useSetAtom(explanationAtom);
  const [isExplanationLoading, setIsExplanationLoading] = useAtom(
    isExplanationLoadingAtom,
  );

  /* Reset explanation when entry changes */
  useEffect(() => {
    setExplanation(null);
  }, [currentEntry, setExplanation]);

  /* Track the most recent entry for which a fetch was initiated */
  const lastFetchedEntryRef = useRef<Entry | null>(null);

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

    /* Prevent multiple fetches for the same entry */
    if (
      currentEntry.explanation ||
      isExplanationLoading ||
      (lastFetchedEntryRef.current &&
        lastFetchedEntryRef.current.clue === currentEntry.clue &&
        lastFetchedEntryRef.current.answer === currentEntry.answer)
    ) {
      return;
    }

    lastFetchedEntryRef.current = currentEntry;
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
  }, [
    currentEntry,
    setExplanation,
    setIsExplanationLoading,
    fetchExplanation,
    isExplanationLoading,
  ]);

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
