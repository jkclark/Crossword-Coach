import * as dotenv from "dotenv";

import DummyDataStore from "storage/src/data-stores/DummyDataStore";
import { DataStore } from "storage/src/dataStore";
import NYTSource from "./crossword-puzzle-sources/NYTSource";
import CrosswordPuzzleSource from "./crosswordPuzzleSource";

dotenv.config({ path: "./scraping/.env" });

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

      /* Store the puzzle */
      await dataStore.savePuzzle(puzzle);
    })
  );
}

if (require.main === module) {
  /* Puzzle source */
  const startDate = new Date("2023-01-01T00:00:00Z");
  const endDate = new Date("2023-02-01T00:00:00Z");
  const nytCookie = process.env.NYT_COOKIE;
  if (!nytCookie) {
    throw new Error("NYT_COOKIE environment variable is not set");
  }
  const dummySource = new NYTSource(startDate, endDate, nytCookie);

  /* Data store */
  const dummyDataStore = new DummyDataStore();

  main(dummySource, dummyDataStore);
}
