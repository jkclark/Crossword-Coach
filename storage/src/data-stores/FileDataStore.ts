import * as fs from "fs";

import { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";
import { DataStore } from "../dataStore";

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

  // TODO: Save all clues to a file and see how big the file is
  // We need to determine what one "entry" looks like for the frontend
  // How would the frontend get the clues?
  async savePuzzle(puzzle: CrosswordPuzzle): Promise<void> {
    const puzzleFileName = `${puzzle.id}.json`;
    console.log(`Saving puzzle with ID = ${puzzle.id} to ${this.entryFolder}/${puzzleFileName}`);

    /* If the file already exists, raise an error */
    if (fs.existsSync(`${this.entryFolder}/${puzzleFileName}`)) {
      throw new Error(`File ${this.entryFolder}/${puzzleFileName} already exists`);
    }

    /* Write the puzzle to a file */
    const puzzleString = JSON.stringify(puzzle, null, 2);
    fs.writeFileSync(`${this.entryFolder}/${puzzleFileName}`, puzzleString, { encoding: "utf-8" });
  }
}
