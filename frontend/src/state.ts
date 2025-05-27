import { atom } from "jotai";

import type { Entry } from "@crosswordcoach/common";

export const isLoadingEntriesAtom = atom(false);
export const allEntriesAtom = atom([] as Entry[]);
export const currentEntryIndexAtom = atom(0);
export const userGaveUpAtom = atom(false);
