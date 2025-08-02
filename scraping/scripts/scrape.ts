import * as dotenv from "dotenv";

import { CrosswordPuzzle, Entry } from "../../common/src/interfaces/CrosswordPuzzle";
import { DataStore } from "../../storage/src/DataStore";
import FileDataStore from "../../storage/src/data-stores/FileDataStore";

// import WSJSource from "../src/crossword-puzzle-sources/WSJSource";
import NYTSource from "../src/crossword-puzzle-sources/NYTSource";
import CrosswordPuzzleSource, {
  CrosswordPuzzleSourceOnTheFly,
  CrosswordPuzzleSourcePreFetchURLs,
} from "../src/crosswordPuzzleSource";

dotenv.config({ path: "./.env" });

type EntryFilter = (entry: Entry) => boolean;

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
  /* Filter theme clues */
  const puzzleNoThemeClues = cwpSource.filterThemeClues(puzzle);

  /* Filter invalid clues */
  const invalidConditions: EntryFilter[] = [
    clueReferencesOtherClue, // Clues that reference other clues
    clueReferencesThePuzzle, // Clues that reference the puzzle itself
  ];
  const puzzleNoInvalidEntries = filterInvalidEntriesFromPuzzle(puzzleNoThemeClues, invalidConditions);

  /* Store the puzzle */
  await dataStore.savePuzzle(puzzleNoInvalidEntries);
}

function filterInvalidEntriesFromPuzzle(
  puzzle: CrosswordPuzzle,
  entryFilters: EntryFilter[]
): CrosswordPuzzle {
  /* Copy the original puzzle */
  const filteredPuzzle = { ...puzzle };

  /* Filter out entries that match any of the provided filters */
  filteredPuzzle.entries = puzzle.entries.filter((entry) => {
    return !entryFilters.some((filter) => filter(entry));
  });

  console.log(
    `Filtered out ${puzzle.entries.length - filteredPuzzle.entries.length} invalid entries from ${puzzle.id}`
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
const clueReferencesOtherClue: EntryFilter = (entry: Entry): boolean => {
  const acrossRegex = /\d+-Across/;
  const downRegex = /\d+-Down/;
  const referencesOtherClue = acrossRegex.test(entry.clue) || downRegex.test(entry.clue);

  if (referencesOtherClue) {
    console.log(`Filtered out clue referencing another clue: ${entry.clue}`);
  }

  return referencesOtherClue;
};

/**
 * Check if a clue references the puzzle itself.
 *
 * A lot of theme clues will reference the puzzle like:
 * "..., or a hint to four squares in this puzzle"
 *
 * We don't want to include these clues because they aren't playable
 * on their own.
 *
 * @param clue The clue to check
 * @returns True if the clue references this puzzle, false otherwise
 */
const clueReferencesThePuzzle: EntryFilter = (entry: Entry): boolean => {
  const thisPuzzleRegex = /this puzzle/i;
  const referencesThePuzzle = thisPuzzleRegex.test(entry.clue);

  if (referencesThePuzzle) {
    console.log(`Filtered out clue referencing the puzzle: ${entry.clue}`);
  }

  return referencesThePuzzle;
};

if (require.main === module) {
  /* NYT */
  const startDate = new Date("2022-01-01T00:00:00Z");
  const endDate = new Date("2022-01-08T00:00:00Z");
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
