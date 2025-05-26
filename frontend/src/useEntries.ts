import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { allEntriesAtom } from "./state";

import type { Entry } from "@crosswordcoach/common";
import type { GetEntriesOptions } from "@crosswordcoach/storage";

export function useEntries(currentEntryIndex: number) {
  const [allEntries, setAllEntries] = useAtom(allEntriesAtom);

  /* Track which pages have already been fetched */
  const fetchedPages = useRef<Set<number>>(new Set());

  const fetchEntries = useCallback(
    async (page: number) => {
      /* If we've already fetched this page, skip it */
      if (fetchedPages.current.has(page)) return; // Already fetched this page

      /* Mark this page as having been fetched */
      fetchedPages.current.add(page);

      const API_URL = buildAPIURL({
        orderBy: "_id",
        orderDirection: "ASC",
        pageSize: import.meta.env.VITE_ENTRIES_PAGE_SIZE,
        page: page,
      });

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
        fetchedPages.current.delete(page);
      }
    },
    [setAllEntries]
  );

  /**
   * Get the full API URL for fetching entries.
   */
  function buildAPIURL(options: GetEntriesOptions): string {
    const { orderBy, orderDirection, pageSize, page } = options;

    return `${import.meta.env.VITE_BASE_API_URL}/${
      import.meta.env.VITE_ENTRIES_PATH
    }?orderBy=${orderBy}&orderDirection=${orderDirection}&pageSize=${pageSize}&page=${page}`;
  }

  /* Initial fetch */
  useEffect(() => {
    if (allEntries.length === 0) {
      fetchEntries(0);
    }
  }, [allEntries.length, fetchEntries]);

  /* Fetch next page if user is near the end of available entries */
  useEffect(() => {
    if (
      allEntries.length > 0 &&
      currentEntryIndex >= allEntries.length - import.meta.env.VITE_ENTRY_BUFFER_BEFORE_NEXT_LOAD
    ) {
      const nextPage = Math.floor(allEntries.length / import.meta.env.VITE_ENTRIES_PAGE_SIZE);
      fetchEntries(nextPage);
    }
  }, [currentEntryIndex, allEntries.length, fetchEntries]);

  return allEntries;
}
