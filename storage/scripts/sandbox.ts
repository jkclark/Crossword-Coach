/**
 * This module mainly exists to test data stores.
 */
import * as dotenv from "dotenv";

import { CrosswordPuzzle, Entry } from "../../common/src/interfaces/CrosswordPuzzle";

import MongoDBDataStore from "../src/data-stores/MongoDBDataStore";
import { DataStore } from "../src/DataStore";

dotenv.config({ path: "./.env" });

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const dataStore = new MongoDBDataStore(uri);

  await dataStore.connect();

  // await doGet(dataStore);
  await doSave(dataStore);

  await dataStore.close();
}

async function doGet(dataStore: DataStore) {
  const options = {
    source: "NYT",
    dayOfWeek: 0,
    orderBy: "_id",
    orderDirection: "ASC",
    pageSize: 10,
    page: 0,
  };

  const entries = await dataStore.getEntries(options);

  console.log("Entries:");
  entries.forEach((entry: Entry) => {
    console.log(`- ${entry.clue} (${entry.answer})`);
  });
}

async function doSave(dataStore: DataStore) {
  /* Read all puzzles from folder into array of puzzle objects */
  const fs = require("fs");
  const path = require("path");
  const puzzlesFolderPath = path.join(__dirname, "../../temp/NYT");
  const puzzleFiles = fs.readdirSync(puzzlesFolderPath);
  const puzzles: CrosswordPuzzle[] = puzzleFiles.map((fileName: string) => {
    const filePath = path.join(puzzlesFolderPath, fileName);
    const puzzleString = fs.readFileSync(filePath, { encoding: "utf-8" });
    const parsedPuzzle = JSON.parse(puzzleString);
    parsedPuzzle.date = new Date(parsedPuzzle.date);
    return parsedPuzzle;
  });

  /* Save each puzzle to the database */
  await savePuzzles(dataStore, puzzles);
}

async function savePuzzles(dataStore: DataStore, puzzles: CrosswordPuzzle[]) {
  await Promise.all(
    puzzles.map((puzzle) => {
      return dataStore.savePuzzle(puzzle);
    })
  );
}

if (require.main === module) {
  main();
}
