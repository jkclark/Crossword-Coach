/**
 * This custom hook handles the automatic updating of entries and entry progress.
 */

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

import type { Entry } from "@crosswordcoach/common";
import type { GetEntriesOptions } from "@crosswordcoach/storage";
import {
  allEntriesAtom,
  entryFilterOptionsAtom,
  isLoadingEntriesAtom,
  PAGE_SIZE,
} from "./state";
import { useEntries } from "./useEntries";
import { useEntryProgress } from "./useEntryProgress";

export function useAutoUpdateEntries() {
  const setIsLoadingEntries = useSetAtom(isLoadingEntriesAtom);
  const [allEntries, setAllEntries] = useAtom(allEntriesAtom);
  const entryFilterOptions = useAtomValue(entryFilterOptionsAtom);

  const { getFilterOptionsEntryProgress, setFilterOptionsEntryProgress } =
    useEntryProgress();

  const {
    currentEntryPage,
    currentEntryIndex,
    goToBeginningOfEntries,
    goToEntryAtPageAndIndex,
    getNextEntryIndexAndPage,
  } = useEntries();

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

  /* On mount, set index and page from localStorage */
  useEffect(() => {
    /* Get the entry progress for the current filter options */
    const filterProgress = getFilterOptionsEntryProgress(entryFilterOptions);
    if (!filterProgress) {
      // If no progress found, start from the beginning //
      goToBeginningOfEntries();
      return;
    }
    /* If progress found, set the current index and page */
    goToEntryAtPageAndIndex(filterProgress.page, filterProgress.entryIndex);
  }, [
    entryFilterOptions,
    getFilterOptionsEntryProgress,
    goToEntryAtPageAndIndex,
    goToBeginningOfEntries,
  ]);

  /* Fetch next page if user is near the end of available entries */
  useEffect(() => {
    if (currentEntryIndex === null || currentEntryPage === null) {
      return;
    }

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
      currentEntryIndex !== null &&
      currentEntryPage !== null
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
      filterProgress?.entryIndex ?? null,
      filterProgress?.page ?? null,
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
    goToEntryAtPageAndIndex(nextPage, nextIndex);
  }, [
    entryFilterOptions,
    fetchEntriesWhileLoading,
    setAllEntries,
    getGetEntriesOptions,
    getFilterOptionsEntryProgress,
    goToBeginningOfEntries,
    goToEntryAtPageAndIndex,
    getNextEntryIndexAndPage,
  ]);
}
