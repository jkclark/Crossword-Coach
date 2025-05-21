import { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";
import { DataStore } from "../dataStore";

export default class DummyDataStore implements DataStore {
  async savePuzzle(puzzle: CrosswordPuzzle): Promise<void> {
    console.log(
      `Saving puzzle for date: ${puzzle.date.getUTCFullYear()}-${
        puzzle.date.getUTCMonth() + 1
      }-${puzzle.date.getUTCDate()}`
    );
    console.log("Num clues:", puzzle.entries.length);
  }
}
