import { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";

export interface DataStore {
  connect(): Promise<void>;

  close(): Promise<void>;

  savePuzzle(puzzle: CrosswordPuzzle): Promise<void>;
}
