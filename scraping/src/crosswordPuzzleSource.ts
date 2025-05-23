import { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";

export default interface CrosswordPuzzleSource {
  getAllPuzzleURLs(): Promise<string[]>;

  getPuzzle(url: string): Promise<CrosswordPuzzle>;

  /**
   * Remove theme clues from the puzzle.
   *
   * @param puzzle The puzzle to filter clues from
   * @returns The filtered puzzle
   */
  filterThemeClues(puzzle: CrosswordPuzzle): CrosswordPuzzle;
}
