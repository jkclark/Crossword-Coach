import { Db, MongoClient } from "mongodb";

import { CrosswordPuzzle, Entry } from "common";

import { DataStore, GetEntriesOptions } from "../DataStore";

export default class MongoDBDataStore implements DataStore {
  private client: MongoClient;
  private db: Db;

  private static readonly DATABASE_NAME = "crosswordcoach";
  private static readonly PUZZLE_COLLECTION = "puzzles";
  private static readonly ENTRIES_COLLECTION = "entries";

  constructor(uri: string) {
    if (!uri) {
      throw new Error("MongoDB URI is required");
    }

    this.client = new MongoClient(uri);
    this.db = this.client.db(MongoDBDataStore.DATABASE_NAME);
  }

  async connect() {
    // NOTE: MongoClient.connect() is idempotent, so we can call it multiple times
    await this.client.connect();
    console.log("Connected to MongoDB");
  }

  async close(): Promise<void> {
    await this.client.close();
    console.log("Closed MongoDB connection");
  }

  async getEntries(options: GetEntriesOptions): Promise<Entry[]> {
    const sort: Record<string, 1 | -1> = {
      [options.orderBy]: options.orderDirection === "ASC" ? 1 : -1,
    };

    const entries = await this.db
      .collection<Entry>(MongoDBDataStore.ENTRIES_COLLECTION)
      .find({})
      .sort(sort)
      .skip(options.page * options.pageSize)
      .limit(options.pageSize)
      .toArray();

    return entries;
  }

  /**
   * Save a puzzle to the database.
   *
   * Puzzles and their clues are stored in two separate collections:
   * - The `puzzles` collection stores the puzzle metadata (e.g., id, date, source, etc.)
   * - The `entries` collection stores the clues and answers, along with a list of puzzle IDs they belong to.
   *
   * @param puzzle The puzzle to save
   */
  async savePuzzle(puzzle: CrosswordPuzzle): Promise<void> {
    await this.connect();

    /* Separate the entries from the puzzle metadata */
    const { entries, ...puzzleMetadata } = puzzle;

    /* Insert puzzle metadata */
    await this.db.collection(MongoDBDataStore.PUZZLE_COLLECTION).updateOne(
      { id: puzzle.id }, // Match by unique puzzle id
      { $set: puzzleMetadata },
      { upsert: true }
    );

    /* Insert entries */
    const entriesCollection = this.db.collection(MongoDBDataStore.ENTRIES_COLLECTION);
    await Promise.all(
      entries.map((entry: Entry) => {
        return entriesCollection.updateOne(
          // Identify the entry by its clue and answer
          { clue: entry.clue, answer: entry.answer },

          // Update the entry with the puzzle ID (regardless of whether it's already present)
          { $addToSet: { puzzle_ids: puzzle.id } },

          // Create the entry if it doesn't exist, otherwise update it
          { upsert: true }
        );
      })
    );

    console.log(`Inserted puzzle ${puzzle.id} into the database`);
  }
}
