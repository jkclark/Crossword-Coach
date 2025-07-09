import { atom } from "jotai";

import type { Entry } from "@crosswordcoach/common";
import type { GetEntriesFilterOptions } from "@crosswordcoach/storage";

export const PAGE_SIZE = import.meta.env.VITE_ENTRIES_PAGE_SIZE;

interface EntryFilterOptionsUI extends GetEntriesFilterOptions {
  revealedLetters?: number;
}
export const entryFilterOptionsAtom = atom({} as EntryFilterOptionsUI);

export const isLoadingEntriesAtom = atom(false);
export const allEntriesAtom = atom({} as { [page: number]: Entry[] });
export const currentEntryIndexAtom = atom<number | undefined>(undefined);
export const currentEntryPageAtom = atom<number | undefined>(undefined);

export const MINIMUM_ANSWER_LENGTH = 3;
export const MAXIMUM_ANSWER_LENGTH = 15;
export const answerLengthMinAtom = atom<number>(MINIMUM_ANSWER_LENGTH);
export const answerLengthMaxAtom = atom<number>(MAXIMUM_ANSWER_LENGTH);
export const revealedLettersAtom = atom<number>(0);

export const correctScoreAtom = atom<number>(0);
export const totalScoreAtom = atom<number>(0);
export const streakAtom = atom<number>(0);

export function getNextEntryIndexAndPage(
  index: number | undefined,
  page: number | undefined,
  pageSize: number,
): {
  nextIndex: number;
  nextPage: number;
} {
  if (index === undefined || page === undefined) {
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
}
