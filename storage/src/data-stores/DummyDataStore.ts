import { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";
import { DataStore } from "../dataStore";

export default class DummyDataStore implements DataStore {
  async savePuzzle(puzzle: CrosswordPuzzle): Promise<void> {
    console.log("Saving puzzle:", puzzle);
  }
}
