import * as fs from "fs";

import { CrosswordPuzzle, Entry } from "common/src/interfaces/CrosswordPuzzle";
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

  async getEntries(): Promise<Entry[]> {
    const entries: Entry[] = [];

    /* Iterate over all files in the folder */
    for (const file of fs.readdirSync(this.entryFolder)) {
      // Only consider JSON files
      if (!file.endsWith(".json")) {
        continue;
      }

      // Read the file
      const filePath = `${this.entryFolder}/${file}`;
      const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
      const puzzle: CrosswordPuzzle = JSON.parse(fileContent);

      // Add all entries to the list
      for (const entry of puzzle.entries) {
        entries.push(entry);
      }
    }

    return entries;
  }

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

if (require.main === module) {
  /* Data store */
  const dummyDataStore = new FileDataStore("./temp/puzzles");

  /* Get all entries */
  dummyDataStore.getEntries().then((entries) => {
    console.log(`Found ${entries.length} entries`);
    console.log(entries[0]);
  });
}
