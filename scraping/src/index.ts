import DummyDataStore from "storage/src/data-stores/DummyDataStore";
import { DataStore } from "storage/src/dataStore";
import DummySource from "./crossword-puzzle-sources/DummySource";
import CrosswordPuzzleSource from "./crosswordPuzzleSource";

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
      console.log(`Scraped puzzle: ${JSON.stringify(puzzle)}`);

      /* Store the puzzle */
      await dataStore.savePuzzle(puzzle);
    })
  );
}

if (require.main === module) {
  const dummySource = new DummySource();
  const dummyDataStore = new DummyDataStore();
  main(dummySource, dummyDataStore);
}
