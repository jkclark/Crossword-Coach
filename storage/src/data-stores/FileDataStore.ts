import * as fs from "fs";

import { CrosswordPuzzle, Entry } from "common";

import { DataStore, GetEntriesOptions } from "../DataStore";

export default class FileDataStore implements DataStore {
  entryFolder: string;

  constructor(entryFolder: string) {
    this.entryFolder = entryFolder;

    /* Create the folder if it doesn't exist */
    if (!fs.existsSync(this.entryFolder)) {
      fs.mkdirSync(this.entryFolder, { recursive: true });
    }
  }

  async connect(): Promise<void> {}

  async close(): Promise<void> {}

  async getEntries(options: GetEntriesOptions): Promise<Entry[]> {
    throw new Error("getEntries not implemented on FileDataStore");
  }

  async savePuzzle(puzzle: CrosswordPuzzle): Promise<void> {
    const puzzleFileName = `${puzzle.id}.json`;
    console.log(`Saving puzzle with ID = ${puzzle.id} to ${this.entryFolder}/${puzzleFileName}`);

    /* Write the puzzle to a file, overwriting if it exists */
    const puzzleString = JSON.stringify(puzzle, null, 2);
    fs.writeFileSync(`${this.entryFolder}/${puzzleFileName}`, puzzleString, { encoding: "utf-8" });
  }

  async saveExplanation(clue: string, answer: string, explanation: string): Promise<void> {
    console.error(`NOT IMPELEMENTED: Saving explanation for clue "${clue}" and answer "${answer}"`);
  }
}
