import { CrosswordPuzzle } from "@common/interfaces/CrosswordPuzzle";

export default interface CrosswordPuzzleSource {
  getAllPuzzleURLs(): Promise<string[]>;

  getPuzzle(): Promise<CrosswordPuzzle>;
}
