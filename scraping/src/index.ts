import CrosswordPuzzleSource from "./ports/crosswordPuzzleSource";

function main(cwpSource: CrosswordPuzzleSource) {
  console.log("Scraping started");
}

if (require.main === module) {
  const dummyCWPSource: CrosswordPuzzleSource = {
    getAllPuzzleURLs: async () => {
      return ["https://example.com/puzzle1", "https://example.com/puzzle2"];
    },
    getPuzzle: async () => {
      return {
        date: "2025-01-01",
      };
    },
  };
  main(dummyCWPSource);
}
