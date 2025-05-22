import { atom } from "jotai";

import type { Entry } from "common/src/interfaces/CrosswordPuzzle";

export const allEntriesAtom = atom([] as Entry[]);
export const currentEntryIndexAtom = atom(0);
