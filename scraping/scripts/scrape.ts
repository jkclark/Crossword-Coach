import * as dotenv from "dotenv";

import { CrosswordPuzzle } from "../../common/src/interfaces/CrosswordPuzzle";
import { DataStore } from "../../storage/src/DataStore";
import FileDataStore from "../../storage/src/data-stores/FileDataStore";

// import WSJSource from "../src/crossword-puzzle-sources/WSJSource";
import NYTSource from "../src/crossword-puzzle-sources/NYTSource";
import CrosswordPuzzleSource, {
  CrosswordPuzzleSourceOnTheFly,
  CrosswordPuzzleSourcePreFetchURLs,
} from "../src/crosswordPuzzleSource";

dotenv.config({ path: "./.env" });

async function mainPreFetchURLs(cwpSource: CrosswordPuzzleSourcePreFetchURLs, dataStore: DataStore) {
  console.log("Scraping started");

  /* Get all puzzle URLs */
  const puzzleURLs = await cwpSource.getAllPuzzleURLs();

  /* Fetch each puzzle and store it */
  Promise.all(
    puzzleURLs.map(async (url) => {
      // Get the puzzle from the URL
      console.log(`Scraping puzzle from URL: ${url}`);
      const puzzle = await cwpSource.getPuzzle(url);

      filterAndStorePuzzle(cwpSource, dataStore, puzzle);
    })
  );
}

async function mainOnTheFly(cwpSource: CrosswordPuzzleSourceOnTheFly, dataStore: DataStore) {
  for await (const puzzle of cwpSource.getAllPuzzles()) {
    console.log(`Scraping puzzle with ID: ${puzzle.id} from source: ${puzzle.source}`);

    // Filter and store the puzzle
    await filterAndStorePuzzle(cwpSource, dataStore, puzzle);
  }
}

async function filterAndStorePuzzle(
  cwpSource: CrosswordPuzzleSource,
  dataStore: DataStore,
  puzzle: CrosswordPuzzle
) {
  // Filter theme clues
  const puzzleNoThemeClues = cwpSource.filterThemeClues(puzzle);

  // Filter clues that reference other clues
  const puzzleNoCluesReferencingOtherClues = filterCluesThatReferenceOtherClues(puzzleNoThemeClues);

  // Store the puzzle
  await dataStore.savePuzzle(puzzleNoCluesReferencingOtherClues);
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
  /* NYT */
  const startDate = new Date("2024-01-01T00:00:00Z");
  const endDate = new Date("2025-04-30T00:00:00Z");
  const cookie = process.env.NYT_COOKIE;

  const puzzleDirectory = NYTSource.SOURCE_NAME_SHORT;

  /* WSJ */
  // Load from WSJDatesAndIds.json
  // const datesAndIds = JSON.parse(fs.readFileSync("./scripts/WSJDatesAndIds.json", "utf-8")).datesAndIds;

  // Convert date strings to Date objects
  // for (const dateAndId of datesAndIds) {
  //   dateAndId.date = new Date(dateAndId.date);
  // }

  // const cookie = process.env.WSJ_COOKIE;

  // const puzzleDirectory = WSJSource.SOURCE_NAME_SHORT;

  if (!cookie) {
    throw new Error("..._COOKIE environment variable is not set");
  }

  const dataSource = new NYTSource(startDate, endDate, cookie);
  // const dataSource = new WSJSource(datesAndIds, cookie);

  /* Data store */
  const dummyDataStore = new FileDataStore(`../temp/${puzzleDirectory}`);

  mainPreFetchURLs(dataSource, dummyDataStore);
  // mainOnTheFly(dataSource, dummyDataStore);
}
