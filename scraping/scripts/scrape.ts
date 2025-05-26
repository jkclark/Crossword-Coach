import * as dotenv from "dotenv";

import { CrosswordPuzzle } from "../../common/src/interfaces/CrosswordPuzzle";
import { DataStore } from "../../storage/src/DataStore";
import FileDataStore from "../../storage/src/data-stores/FileDataStore";

import WSJSource from "../src/crossword-puzzle-sources/WSJSource";
import CrosswordPuzzleSource from "../src/crosswordPuzzleSource";

dotenv.config({ path: "./.env" });

async function main(cwpSource: CrosswordPuzzleSource, dataStore: DataStore) {
  console.log("Scraping started");

  /* Get all puzzle URLs */
  const puzzleURLs = await cwpSource.getAllPuzzleURLs();

  /* Fetch each puzzle and store it */
  Promise.all(
    puzzleURLs.map(async (url) => {
      // Get the puzzle from the URL
      console.log(`Scraping puzzle from URL: ${url}`);
      const puzzle = await cwpSource.getPuzzle(url);

      // Filter theme clues
      const puzzleNoThemeClues = cwpSource.filterThemeClues(puzzle);

      // Filter clues that reference other clues
      const puzzleNoCluesReferencingOtherClues = filterCluesThatReferenceOtherClues(puzzleNoThemeClues);

      // Store the puzzle
      await dataStore.savePuzzle(puzzleNoCluesReferencingOtherClues);
    })
  );
}

/**
 * Filter clues that reference other clues from the crossword puzzle.
 *
 * @param puzzle The crossword puzzle to filter
 * @returns A new crossword puzzle with clues that reference other clues filtered out
 */
function filterCluesThatReferenceOtherClues(puzzle: CrosswordPuzzle): CrosswordPuzzle {
  /* Copy the original puzzle */
  const filteredPuzzle = { ...puzzle };

  /* Filter out clues that reference other clues */
  filteredPuzzle.entries = puzzle.entries.filter((entry) => {
    return !clueReferencesOtherClue(entry.clue);
  });

  console.log(
    `Filtered out ${
      puzzle.entries.length - filteredPuzzle.entries.length
    } clues that reference other clues from ${puzzle.id}`
  );
  return filteredPuzzle;
}

/**
 * Check if a clue references another clue.
 *
 * If the clue contains a string like "<number>-Across" or "<number>-Down",
 * it is considered to reference another clue.
 *
 * @param clue The clue to check
 * @returns True if the clue references another clue, false otherwise
 */
function clueReferencesOtherClue(clue: string): boolean {
  const acrossRegex = /\d+-Across/;
  const downRegex = /\d+-Down/;
  return acrossRegex.test(clue) || downRegex.test(clue);
}

if (require.main === module) {
  /* Puzzle source */
  const startDate = new Date("2023-01-01T00:00:00Z");
  const endDate = new Date("2023-01-01T00:00:00Z");
  // const cookie = process.env.NYT_COOKIE;
  const cookie = process.env.WSJ_COOKIE;

  if (!cookie) {
    throw new Error("..._COOKIE environment variable is not set");
  }

  // const dataSource = new NYTSource(startDate, endDate, cookie);
  const dataSource = new WSJSource(startDate, endDate, cookie);

  /* Data store */
  const dummyDataStore = new FileDataStore("../temp/puzzles_filtered");

  main(dataSource, dummyDataStore);
}
