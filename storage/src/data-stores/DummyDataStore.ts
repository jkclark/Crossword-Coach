import { CrosswordPuzzle, Entry } from "common";

import { DataStore } from "../DataStore";

export default class DummyDataStore implements DataStore {
  async connect(): Promise<void> {}

  async close(): Promise<void> {}

  async getEntries(): Promise<Entry[]> {
    return [];
  }

  async savePuzzle(puzzle: CrosswordPuzzle): Promise<void> {
    console.log(
      `Saving puzzle for date: ${puzzle.date.getUTCFullYear()}-${
        puzzle.date.getUTCMonth() + 1
      }-${puzzle.date.getUTCDate()}`
    );
    console.log("Num clues:", puzzle.entries.length);
  }

  async saveExplanation(clue: string, answer: string, explanation: string): Promise<void> {
    console.error(`NOT IMPLEMENTED: Saving explanation for clue "${clue}" and answer "${answer}"`);
  }
}
