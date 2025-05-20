import { CrosswordPuzzle } from "@common/interfaces/CrosswordPuzzle";
import CrosswordPuzzleSource from "../crosswordPuzzleSource";

export default class DummySource implements CrosswordPuzzleSource {
  async getAllPuzzleURLs(): Promise<string[]> {
    return ["https://example.com/puzzle1", "https://example.com/puzzle2"];
  }

  async getPuzzle(): Promise<CrosswordPuzzle> {
    return {
      id: "12345",
      date: new Date("2025-01-01"),
      source: "foo",
      words: { "Egyptian snake": "ASP" },
    };
  }
}
