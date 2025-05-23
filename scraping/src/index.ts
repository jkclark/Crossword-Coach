import * as dotenv from "dotenv";

import FileDataStore from "storage/src/data-stores/FileDataStore";
import { DataStore } from "storage/src/dataStore";
import NYTSource from "./crossword-puzzle-sources/NYTSource";
import CrosswordPuzzleSource from "./crosswordPuzzleSource";

dotenv.config({ path: "./.env" });

async function main(cwpSource: CrosswordPuzzleSource, dataStore: DataStore) {
  console.log("Scraping started");

  /* Get all puzzle URLs */
  const puzzleURLs = await cwpSource.getAllPuzzleURLs();

  /* Fetch each puzzle and store it */
  Promise.all(
    puzzleURLs.map(async (url) => {
      /* Get the puzzle from the URL */
      console.log(`Scraping puzzle from URL: ${url}`);
      const puzzle = await cwpSource.getPuzzle(url);

      /* Filter theme clues */
      const puzzleNoThemeClues = cwpSource.filterThemeClues(puzzle);

      /* Store the puzzle */
      await dataStore.savePuzzle(puzzleNoThemeClues);
    })
  );
}

if (require.main === module) {
  /* Puzzle source */
  const startDate = new Date("2023-01-01T00:00:00Z");
  const endDate = new Date("2023-01-02T00:00:00Z");
  const nytCookie = process.env.NYT_COOKIE;
  if (!nytCookie) {
    throw new Error("NYT_COOKIE environment variable is not set");
  }
  const dummySource = new NYTSource(startDate, endDate, nytCookie);

  /* Data store */
  const dummyDataStore = new FileDataStore("./temp/puzzles");

  main(dummySource, dummyDataStore);
}
