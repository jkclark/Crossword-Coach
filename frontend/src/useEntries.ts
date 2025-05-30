import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { allEntriesAtom, currentEntryIndexAtom, entryFilterOptionsAtom, isLoadingEntriesAtom } from "./state";

import type { Entry } from "@crosswordcoach/common";
import type { GetEntriesFilterOptions, GetEntriesOptions } from "@crosswordcoach/storage";

interface FilterOptionsEntryProgress {
  entryIndex: number; // Index of the last-seen entry on the current page
  page: number; // Page number of the last-seen entry
}

const ENTRY_PROGRESS_KEY_PREFIX = "entryProgress:";
const PAGE_SIZE = import.meta.env.VITE_ENTRIES_PAGE_SIZE;

export function useEntries() {
  const entryFilterOptions = useAtomValue(entryFilterOptionsAtom);
  const setIsLoadingEntries = useSetAtom(isLoadingEntriesAtom);
  const [allEntries, setAllEntries] = useAtom(allEntriesAtom);
  const [currentEntryIndex, setCurrentEntryIndex] = useAtom(currentEntryIndexAtom);

  function calculateNextEntryIndexAndPage(filterProgress: FilterOptionsEntryProgress | undefined): {
    nextIndex: number;
    nextPage: number;
  } {
    if (!filterProgress) {
      return { nextIndex: 0, nextPage: 0 };
    }

    const lastEntryIndex = filterProgress.entryIndex;
    const lastEntryPage = filterProgress.page;

    // If the last seen entry index is at the end of the page, fetch the next page
    if (lastEntryIndex >= PAGE_SIZE - 1) {
      return { nextIndex: 0, nextPage: lastEntryPage + 1 };
    } else {
      // If the last seen entry index is not at the end of the page, continue from the current page
      return { nextIndex: lastEntryIndex + 1, nextPage: lastEntryPage };
    }
  }

  function getFilterOptionsKey(filterOptions: GetEntriesFilterOptions): string {
    /* Remove keys with null or undefined values */
    const cleaned = Object.fromEntries(
      Object.entries(filterOptions).filter(([, v]) => v !== null && v !== undefined)
    );

    return `${ENTRY_PROGRESS_KEY_PREFIX}${JSON.stringify(cleaned, Object.keys(cleaned).sort())}`;
  }

  const getFilterOptionsEntryProgress = useCallback(
    (entryFilterOptions: GetEntriesFilterOptions): FilterOptionsEntryProgress | undefined => {
      /* Get the key for the current filter options */
      const filterOptionsKey = getFilterOptionsKey(entryFilterOptions);
      console.log("Retrieving entry progress for filter options key:", filterOptionsKey);

      /* Try to retrieve the entry progress from localStorage */
      console.log();
      const entryProgress = localStorage.getItem(filterOptionsKey);

      /* If we have entry progress for these filter options, parse and return it */
      if (entryProgress) {
        console.log("Found entry progress in localStorage:", entryProgress);
        return JSON.parse(entryProgress) as FilterOptionsEntryProgress;
      } else {
        console.log("!!No entry progress found in localStorage for key:", filterOptionsKey);
      }

      /* If no entry progress found, return undefined */
      console.log("No entry progress found in localStorage for key:", filterOptionsKey);
      return undefined;
    },
    []
  );

  const setFilterOptionsEntryProgress = useCallback(
    (entryFilterOptions: GetEntriesFilterOptions, entryIndex: number, page: number): void => {
      /* Get the key for the current filter options */
      const filterOptionsKey = getFilterOptionsKey(entryFilterOptions);

      /* Create the entry progress object */
      const entryProgress: FilterOptionsEntryProgress = {
        entryIndex,
        page,
      };

      /* Store the entry progress in localStorage */
      localStorage.setItem(filterOptionsKey, JSON.stringify(entryProgress));
    },
    []
  );

  const getGetEntriesOptions = useCallback(
    (page: number): GetEntriesOptions => {
      return {
        ...entryFilterOptions, // Include any filter options
        orderBy: "_id",
        orderDirection: "ASC",
        pageSize: PAGE_SIZE,
        page: page,
      };
    },
    [entryFilterOptions]
  );

  const fetchEntries = useCallback(async (getEntriesOptions: GetEntriesOptions): Promise<Entry[]> => {
    const API_URL = buildAPIURL(getEntriesOptions);

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch entries");

      const data = await res.json();

      if (!Array.isArray(data.entries)) {
        throw new Error("Invalid response format: 'entries' is not an array");
      } else {
        return data.entries as Entry[];
      }
    } catch (err) {
      console.error("Error fetching entries:", err);
      return [];
    }
  }, []);

  const fetchEntriesWhileLoading = useCallback(
    async (getEntriesOptions: GetEntriesOptions): Promise<Entry[]> => {
      setIsLoadingEntries(true);

      let entries: Entry[] = [];
      try {
        entries = await fetchEntries(getEntriesOptions);
      } catch (err) {
        console.error("Error fetching entries while loading:", err);
        entries = [];
      } finally {
        setIsLoadingEntries(false);
      }

      return entries;
    },
    [setIsLoadingEntries, fetchEntries]
  );

  /**
   * Get the full API URL for fetching entries.
   */
  function buildAPIURL(options: GetEntriesOptions): string {
    const params = new URLSearchParams({
      orderBy: options.orderBy,
      orderDirection: options.orderDirection,
      pageSize: options.pageSize.toString(),
      page: options.page.toString(),
    });

    if (options.source) params.append("source", options.source);
    if (options.dayOfWeek || options.dayOfWeek === 0) {
      params.append("dayOfWeek", options.dayOfWeek.toString());
    }

    return `${import.meta.env.VITE_BASE_API_URL}/${import.meta.env.VITE_ENTRIES_PATH}?${params.toString()}`;
  }

  // TODO: Seemingly a lot of issues here. Seems to be devolving into spaghetti code.
  // I think I need to rethink all of this and how it will work, and perhaps author
  // it from scratch.

  /* Fetch next page if user is near the end of available entries */
  useEffect(() => {
    if (
      allEntries.length > 0 &&
      currentEntryIndex >= allEntries.length - import.meta.env.VITE_ENTRY_BUFFER_BEFORE_NEXT_LOAD
    ) {
      console.log("Need to get more entries");
    }
  }, [currentEntryIndex, allEntries.length, fetchEntriesWhileLoading, getGetEntriesOptions]);

  /* When current index changes, update localStorage progress */
  useEffect(() => {
    console.log("Current entry index changed:", currentEntryIndex);
    if (entryFilterOptions && currentEntryIndex !== undefined) {
      const currentProgress = getFilterOptionsEntryProgress(entryFilterOptions);
      console.log("Current progress:", currentProgress);
      setFilterOptionsEntryProgress(
        entryFilterOptions,
        currentEntryIndex % PAGE_SIZE,
        Math.floor(currentEntryIndex / PAGE_SIZE) + (currentProgress?.page || 0)
      );
    }
  }, [entryFilterOptions, currentEntryIndex, getFilterOptionsEntryProgress, setFilterOptionsEntryProgress]);

  /**
   * Without skipping the initial mount, the effect runs on the first render,
   * causing us to skip the first entry. Also, note that in React Strict Mode,
   * the effect runs twice on initial mount, so we see a skipping of the first
   * entry anyway. In production, we do not see this behavior.
   */
  const didMountRef = useRef(false);

  /* Fetch entries when filter options change */
  useEffect(() => {
    // See note above
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // Skip initial mount
    }

    console.log("Fetching entries for new filter options:", entryFilterOptions);

    /* Clear existing entries */
    setAllEntries([]);

    /* Calculate the next entry index and page based on the current filter options/progress */
    const filterProgress = getFilterOptionsEntryProgress(entryFilterOptions);
    const { nextIndex, nextPage } = calculateNextEntryIndexAndPage(filterProgress);
    console.log("Next entry index:", nextIndex, "Next page:", nextPage);

    /* Fetch entries based on the calculated start index and page */
    (async () => {
      setAllEntries(await fetchEntriesWhileLoading(getGetEntriesOptions(nextPage)));
    })();

    /* Set the current entry index to the calculated start index */
    console.log("Setting current entry index to:", nextIndex);
    setCurrentEntryIndex(nextIndex);
  }, [
    entryFilterOptions,
    fetchEntriesWhileLoading,
    setAllEntries,
    getGetEntriesOptions,
    getFilterOptionsEntryProgress,
    setCurrentEntryIndex,
  ]);

  return allEntries;
}
