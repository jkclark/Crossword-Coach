/**
 * This custom hook provides functionality to manage entry progress in localStorage.
 */
import type { GetEntriesFilterOptions } from "@crosswordcoach/storage";
import { useCallback } from "react";

const ENTRY_PROGRESS_KEY_PREFIX = "entryProgress:";

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

interface FilterOptionsEntryProgress {
  entryIndex: number; // Index of the last-seen entry on the current page
  page: number; // Page number of the last-seen entry
}

export function useEntryProgress() {
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
  const stableStringify = useCallback((obj: JSONValue): string => {
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
  }, []);

  const getFilterOptionsKey = useCallback(
    (filterOptions: GetEntriesFilterOptions): string => {
      /* Remove keys with undefined values */
      const cleaned = Object.fromEntries(
        Object.entries(filterOptions).filter(([, v]) => v !== undefined),
      );

      const val = `${ENTRY_PROGRESS_KEY_PREFIX}${stableStringify(cleaned)}`;
      return val;
    },
    [stableStringify],
  );

  const getFilterOptionsEntryProgress = useCallback(
    (
      entryFilterOptions: GetEntriesFilterOptions,
    ): FilterOptionsEntryProgress | null => {
      /* Get the key for the current filter options */
      const filterOptionsKey = getFilterOptionsKey(entryFilterOptions);

      /* Try to retrieve the entry progress from localStorage */
      const entryProgress = localStorage.getItem(filterOptionsKey);

      /* If we have entry progress for these filter options, parse and return it */
      if (entryProgress) {
        return JSON.parse(entryProgress) as FilterOptionsEntryProgress;
      }

      /* If no entry progress found, return undefined */
      return null;
    },
    [getFilterOptionsKey],
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
    [getFilterOptionsKey],
  );

  return {
    getFilterOptionsKey,
    getFilterOptionsEntryProgress,
    setFilterOptionsEntryProgress,
  };
}
