import { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";

export default interface CrosswordPuzzleSource {
  getPuzzle(url: string): Promise<CrosswordPuzzle>;

  /**
   * Remove theme clues from the puzzle.
   *
   * @param puzzle The puzzle to filter clues from
   * @returns The filtered puzzle
   */
  filterThemeClues(puzzle: CrosswordPuzzle): CrosswordPuzzle;
}

/**
 * This is the more straightforward "pre-fetch" interface for crossword puzzle sources.
 * The idea is that we can determine a list of URLs in advance, and then fetch
 * puzzle in parallel.
 */
export interface CrosswordPuzzleSourcePreFetchURLs extends CrosswordPuzzleSource {
  getAllPuzzleURLs(): Promise<string[]>;
}

/**
 * This was created to allow for sources that are "guessing" the puzzle URLs,
 * and thus do not have a predefined list of URLs.
 *
 * WSJ was the source that inspired this interface.
 */
export interface CrosswordPuzzleSourceOnTheFly extends CrosswordPuzzleSource {
  getAllPuzzles(): AsyncGenerator<CrosswordPuzzle>;
}
