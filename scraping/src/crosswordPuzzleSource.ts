import { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";

export default interface CrosswordPuzzleSource {
  getAllPuzzleURLs(): Promise<string[]>;

  getPuzzle(url: string): Promise<CrosswordPuzzle>;
}
