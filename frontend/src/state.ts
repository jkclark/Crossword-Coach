import { atom } from "jotai";

import type { Entry } from "@crosswordcoach/common";
import type { GetEntriesFilterOptions } from "@crosswordcoach/storage";

export const PAGE_SIZE = import.meta.env.VITE_ENTRIES_PAGE_SIZE;

export const isLoadingEntriesAtom = atom(false);
export const currentEntryPageAtom = atom<number | null>(null);
export const currentEntryIndexAtom = atom<number | null>(null);
export const allEntriesAtom = atom({} as { [page: number]: Entry[] });

export const MINIMUM_ANSWER_LENGTH = 3;
export const MAXIMUM_ANSWER_LENGTH = 15;
const INITIAL_ANSWER_LENGTH_MIN = 4;
const INITIAL_ANSWER_LENGTH_MAX = 10;
export const answerLengthMinAtom = atom<number>(INITIAL_ANSWER_LENGTH_MIN);
export const answerLengthMaxAtom = atom<number>(INITIAL_ANSWER_LENGTH_MAX);
export const revealedLettersAtom = atom<number>(2);

interface EntryFilterOptionsUI extends GetEntriesFilterOptions {
  revealedLetters?: number;
}
export const entryFilterOptionsAtom = atom({
  answerLength: {
    min: INITIAL_ANSWER_LENGTH_MIN,
    max: INITIAL_ANSWER_LENGTH_MAX,
  },
} as EntryFilterOptionsUI);

export const correctScoreAtom = atom<number>(0);
export const totalScoreAtom = atom<number>(0);
export const streakAtom = atom<number>(0);

export const explanationAtom = atom<string | null>(null);
export const isExplanationLoadingAtom = atom<boolean>(false);
