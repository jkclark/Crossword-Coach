import { CrosswordPuzzle, Entry } from "common/src/interfaces/CrosswordPuzzle";

export interface DataStore {
  getEntries(): Promise<Entry[]>;

  savePuzzle(puzzle: CrosswordPuzzle): Promise<void>;
}
