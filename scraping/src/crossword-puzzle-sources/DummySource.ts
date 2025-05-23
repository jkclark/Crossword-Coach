import { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";
import CrosswordPuzzleSource from "../crosswordPuzzleSource";

export default class DummySource implements CrosswordPuzzleSource {
  async getAllPuzzleURLs(): Promise<string[]> {
    return ["https://example.com/puzzle1", "https://example.com/puzzle2"];
  }

  async getPuzzle(url: string): Promise<CrosswordPuzzle> {
    return {
      id: "12345",
      date: new Date("2025-01-01"),
      source: "foo",
      entries: [{ clue: "Egyptian serpent", answer: "ASP" }],
    };
  }

  filterThemeClues(puzzle: CrosswordPuzzle): CrosswordPuzzle {
    return puzzle;
  }
}
