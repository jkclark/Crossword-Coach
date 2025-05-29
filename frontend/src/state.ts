import { atom } from "jotai";

import type { Entry } from "@crosswordcoach/common";
import type { GetEntriesFilterOptions } from "@crosswordcoach/storage";

export const entryFilterOptionsAtom = atom({} as GetEntriesFilterOptions);
export const isLoadingEntriesAtom = atom(false);
export const allEntriesAtom = atom([] as Entry[]);
export const currentEntryIndexAtom = atom(0);
