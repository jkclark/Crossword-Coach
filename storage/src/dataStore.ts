import { CrosswordPuzzle } from "../../common/src/interfaces/CrosswordPuzzle";

export interface DataStore {
  savePuzzle(puzzle: CrosswordPuzzle): Promise<void>;
}
