/**
 * This custom hook provides functionality to navigate through entries.
 */
import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";

import type { Entry } from "@crosswordcoach/common";
import {
  allEntriesAtom,
  currentEntryIndexAtom,
  currentEntryPageAtom,
  PAGE_SIZE,
} from "./state";

export function useEntries() {
  const [currentEntryPage, setCurrentEntryPage] = useAtom(currentEntryPageAtom);
  const [currentEntryIndex, setCurrentEntryIndex] = useAtom(
    currentEntryIndexAtom,
  );
  const allEntries = useAtomValue(allEntriesAtom);

  const currentEntry: Entry | null =
    (currentEntryIndex !== null &&
      currentEntryPage !== null &&
      allEntries[currentEntryPage]?.[currentEntryIndex]) ||
    null;

  const goToBeginningOfEntries = useCallback((): void => {
    setCurrentEntryIndex(0);
    setCurrentEntryPage(0);
  }, [setCurrentEntryIndex, setCurrentEntryPage]);

  const getNextEntryIndexAndPage = useCallback(
    (
      index: number | null,
      page: number | null,
      pageSize: number,
    ): {
      nextIndex: number;
      nextPage: number;
    } => {
      if (index === null || page === null) {
        // If index or page is undefined, start from the beginning
        return { nextIndex: 0, nextPage: 0 };
      }

      // If the index is at the end of the page, move to the next page
      if (index >= pageSize - 1) {
        return { nextIndex: 0, nextPage: page + 1 };
      } else {
        // Otherwise, just increment the index
        return { nextIndex: index + 1, nextPage: page };
      }
    },
    [],
  );

  const goToEntryAtPageAndIndex = useCallback(
    (page: number, index: number): void => {
      setCurrentEntryPage(page);
      setCurrentEntryIndex(index);
    },
    [setCurrentEntryPage, setCurrentEntryIndex],
  );

  const goToNextEntry = useCallback(() => {
    const { nextIndex, nextPage } = getNextEntryIndexAndPage(
      currentEntryIndex,
      currentEntryPage,
      PAGE_SIZE,
    );
    goToEntryAtPageAndIndex(nextPage, nextIndex);
  }, [
    getNextEntryIndexAndPage,
    currentEntryIndex,
    currentEntryPage,
    goToEntryAtPageAndIndex,
  ]);

  return {
    currentEntryPage,
    currentEntryIndex,
    currentEntry,

    getNextEntryIndexAndPage,

    goToBeginningOfEntries,
    goToNextEntry,
    goToEntryAtPageAndIndex,
  };
}
