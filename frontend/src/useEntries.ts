import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import {
  allEntriesAtom,
  currentEntryIndexAtom,
  currentEntryPageAtom,
  entryFilterOptionsAtom,
  getNextEntryIndexAndPage,
  isLoadingEntriesAtom,
  PAGE_SIZE,
} from "./state";

import type { Entry } from "@crosswordcoach/common";
import type {
  GetEntriesFilterOptions,
  GetEntriesOptions,
} from "@crosswordcoach/storage";

interface FilterOptionsEntryProgress {
  entryIndex: number; // Index of the last-seen entry on the current page
  page: number; // Page number of the last-seen entry
}

const ENTRY_PROGRESS_KEY_PREFIX = "entryProgress:";

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export function useEntries() {
  const entryFilterOptions = useAtomValue(entryFilterOptionsAtom);
  const setIsLoadingEntries = useSetAtom(isLoadingEntriesAtom);
  const [allEntries, setAllEntries] = useAtom(allEntriesAtom);
  const [currentEntryIndex, setCurrentEntryIndex] = useAtom(
    currentEntryIndexAtom,
  );
  const [currentEntryPage, setCurrentEntryPage] = useAtom(currentEntryPageAtom);

  function getFilterOptionsKey(filterOptions: GetEntriesFilterOptions): string {
    /* Remove keys with undefined values */
    const cleaned = Object.fromEntries(
      Object.entries(filterOptions).filter(([, v]) => v !== undefined),
    );

    const val = `${ENTRY_PROGRESS_KEY_PREFIX}${stableStringify(cleaned)}`;
    return val;
  }

  /**
   * Serialize an object to a string.
   *
   * This function handles arrays and objects by sorting their keys
   * to ensure a stable string representation. It is useful for generating
   * consistent keys.
   *
   * @param obj The object to stringify
   * @returns A stable string representation of the object
   */
  function stableStringify(obj: JSONValue): string {
    if (Array.isArray(obj)) {
      return `[${obj.map(stableStringify).join(",")}]`;
    } else if (obj && typeof obj === "object") {
      return `{${Object.keys(obj)
        .sort()
        .map(
          (key) =>
            JSON.stringify(key) +
            ":" +
            stableStringify((obj as { [key: string]: JSONValue })[key]),
        )
        .join(",")}}`;
    } else {
      return JSON.stringify(obj);
    }
  }

  const getFilterOptionsEntryProgress = useCallback(
    (
      entryFilterOptions: GetEntriesFilterOptions,
    ): FilterOptionsEntryProgress | undefined => {
      /* Get the key for the current filter options */
      const filterOptionsKey = getFilterOptionsKey(entryFilterOptions);

      /* Try to retrieve the entry progress from localStorage */
      const entryProgress = localStorage.getItem(filterOptionsKey);

      /* If we have entry progress for these filter options, parse and return it */
      if (entryProgress) {
        return JSON.parse(entryProgress) as FilterOptionsEntryProgress;
      }

      /* If no entry progress found, return undefined */
      return undefined;
    },
    [],
  );

  const setFilterOptionsEntryProgress = useCallback(
    (
      entryFilterOptions: GetEntriesFilterOptions,
      entryIndex: number,
      page: number,
    ): void => {
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
    [],
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
    [entryFilterOptions],
  );

  const fetchEntries = useCallback(
    async (getEntriesOptions: GetEntriesOptions): Promise<Entry[]> => {
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
    },
    [],
  );

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
    [setIsLoadingEntries, fetchEntries],
  );

  /**
   * Get the full API URL for fetching entries.
   *
   * When new options get added, this function will need to be updated
   * to include them in the URL parameters.
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
    if (options.answerLength) {
      params.append("answerLengthMin", options.answerLength.min.toString());
      params.append("answerLengthMax", options.answerLength.max.toString());
    }

    return `${import.meta.env.VITE_BASE_API_URL}/${import.meta.env.VITE_ENTRIES_PATH}?${params.toString()}`;
  }

  /* On mount, set index and page from localStorage */
  useEffect(() => {
    /* Get the entry progress for the current filter options */
    const filterProgress = getFilterOptionsEntryProgress(entryFilterOptions);
    if (!filterProgress) {
      // If no progress found, start from the beginning //
      setCurrentEntryIndex(0);
      setCurrentEntryPage(0);
      return;
    }
    /* If progress found, set the current index and page */
    setCurrentEntryIndex(filterProgress.entryIndex);
    setCurrentEntryPage(filterProgress.page);
  }, [
    entryFilterOptions,
    getFilterOptionsEntryProgress,
    setCurrentEntryIndex,
    setCurrentEntryPage,
  ]);

  /* Fetch next page if user is near the end of available entries */
  useEffect(() => {
    if (currentEntryIndex === undefined || currentEntryPage === undefined)
      return;

    if (
      allEntries[currentEntryPage] &&
      currentEntryIndex >=
        allEntries[currentEntryPage].length -
          import.meta.env.VITE_ENTRY_BUFFER_BEFORE_NEXT_LOAD &&
      allEntries[currentEntryPage + 1] === undefined // Only fetch next page if it doesn't already exist
    ) {
      // Get the next page number based on the current entry index
      const nextPage = currentEntryPage + 1;

      (async () => {
        // Fetch entries for the next page
        const newEntries = await fetchEntriesWhileLoading(
          getGetEntriesOptions(nextPage),
        );

        // Add the new entries to the existing ones
        setAllEntries((prevEntries) => {
          return { ...prevEntries, [nextPage]: newEntries };
        });
      })();
    }
  }, [
    currentEntryIndex,
    currentEntryPage,
    allEntries,
    setAllEntries,
    fetchEntriesWhileLoading,
    getGetEntriesOptions,
  ]);

  /* When current index or current page changes, update localStorage progress */
  const entryFilterOptionsRef = useRef(entryFilterOptions);
  useEffect(() => {
    if (currentEntryIndex === undefined || currentEntryPage === undefined)
      return;

    if (
      entryFilterOptionsRef.current &&
      currentEntryIndex !== undefined &&
      currentEntryPage !== undefined
    ) {
      setFilterOptionsEntryProgress(
        entryFilterOptionsRef.current,
        currentEntryIndex,
        currentEntryPage,
      );
    }
  }, [
    currentEntryIndex,
    currentEntryPage,
    getFilterOptionsEntryProgress,
    setFilterOptionsEntryProgress,
  ]);

  /* Fetch entries when filter options change */
  useEffect(() => {
    /* Set the current filter options in the ref */
    entryFilterOptionsRef.current = entryFilterOptions;

    /* Calculate the next entry index and page based on the current filter options/progress */
    const filterProgress = getFilterOptionsEntryProgress(entryFilterOptions);

    const { nextIndex, nextPage } = getNextEntryIndexAndPage(
      filterProgress?.entryIndex,
      filterProgress?.page,
      PAGE_SIZE,
    );

    /* Fetch entries based on the calculated start index and page */
    (async () => {
      setAllEntries({
        [nextPage]: await fetchEntriesWhileLoading(
          getGetEntriesOptions(nextPage),
        ),
      });
    })();

    /* Set the current entry index and page to the calculated start index */
    if (nextIndex === 0) {
      setCurrentEntryIndex(nextIndex);
      setCurrentEntryPage(nextPage);
    } else {
      setCurrentEntryIndex(nextIndex);
    }
  }, [
    entryFilterOptions,
    fetchEntriesWhileLoading,
    setAllEntries,
    getGetEntriesOptions,
    getFilterOptionsEntryProgress,
    setCurrentEntryIndex,
    setCurrentEntryPage,
  ]);

  return allEntries;
}
