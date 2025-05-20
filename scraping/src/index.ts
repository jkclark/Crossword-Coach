import DummySource from "./crossword-puzzle-sources/dummySource";
import CrosswordPuzzleSource from "./crosswordPuzzleSource";

async function main(cwpSource: CrosswordPuzzleSource) {
  console.log("Scraping started");

  /* Get all puzzle URLs */
  const puzzleURLs = await cwpSource.getAllPuzzleURLs();

  /* Fetch each puzzle and store it */
  Promise.all(
    puzzleURLs.map(async (url) => {
      console.log(`Scraping puzzle from URL: ${url}`);
      const puzzle = await cwpSource.getPuzzle();
      console.log(`Scraped puzzle: ${JSON.stringify(puzzle)}`);
      // TODO: Store the puzzle
    })
  );
}

if (require.main === module) {
  const dummySource = new DummySource();
  main(dummySource);
}
