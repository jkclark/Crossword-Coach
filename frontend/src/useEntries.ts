import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { allEntriesAtom, entryFilterOptionsAtom, isLoadingEntriesAtom } from "./state";

import type { Entry } from "@crosswordcoach/common";
import type { GetEntriesOptions } from "@crosswordcoach/storage";

export function useEntries(currentEntryIndex: number) {
  const entryFilterOptions = useAtomValue(entryFilterOptionsAtom);
  const setIsLoadingEntries = useSetAtom(isLoadingEntriesAtom);
  const [allEntries, setAllEntries] = useAtom(allEntriesAtom);

  /* Track which pages have already been fetched */
  const fetchedPages = useRef<Set<number>>(new Set());

  const getGetEntriesOptions = useCallback(
    (page: number): GetEntriesOptions => {
      return {
        ...entryFilterOptions, // Include any filter options
        orderBy: "_id",
        orderDirection: "ASC",
        pageSize: import.meta.env.VITE_ENTRIES_PAGE_SIZE,
        page: page,
      };
    },
    [entryFilterOptions]
  );

  const fetchEntries = useCallback(
    async (getEntriesOptions: GetEntriesOptions) => {
      /* If we've already fetched this page, skip it */
      if (fetchedPages.current.has(getEntriesOptions.page)) return; // Already fetched this page

      /* Mark this page as having been fetched */
      fetchedPages.current.add(getEntriesOptions.page);

      setIsLoadingEntries(true);

      const API_URL = buildAPIURL(getEntriesOptions);

      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch entries");

        const data = await res.json();

        if (Array.isArray(data.entries)) {
          setAllEntries((prev: Entry[]) => [...prev, ...data.entries]);
        }
      } catch (err) {
        console.error("Error fetching entries:", err);

        /* If we failed to fetch this page, remove it from the set */
        fetchedPages.current.delete(getEntriesOptions.page);
      } finally {
        setIsLoadingEntries(false);
      }
    },
    [setAllEntries, setIsLoadingEntries]
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

  /* Initial fetch */
  useEffect(() => {
    if (allEntries.length === 0) {
      fetchEntries(getGetEntriesOptions(0));
    }
  }, [allEntries.length, fetchEntries, getGetEntriesOptions]);

  /* Fetch next page if user is near the end of available entries */
  useEffect(() => {
    if (
      allEntries.length > 0 &&
      currentEntryIndex >= allEntries.length - import.meta.env.VITE_ENTRY_BUFFER_BEFORE_NEXT_LOAD
    ) {
      const nextPage = Math.floor(allEntries.length / import.meta.env.VITE_ENTRIES_PAGE_SIZE);
      fetchEntries(getGetEntriesOptions(nextPage));
    }
  }, [currentEntryIndex, allEntries.length, fetchEntries, getGetEntriesOptions]);

  /* Fetch entries when filter options change */
  useEffect(() => {
    if (entryFilterOptions) {
      // Reset fetched pages when filter options change
      fetchedPages.current.clear();
      setAllEntries([]); // Clear existing entries
      fetchEntries(getGetEntriesOptions(0)); // Fetch first page with new options
    }
  }, [entryFilterOptions, fetchEntries, setAllEntries, getGetEntriesOptions]);

  return allEntries;
}
