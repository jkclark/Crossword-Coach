import { Db, MongoClient } from "mongodb";

import { CrosswordPuzzle, Entry } from "common";

import { DataStore, GetEntriesOptions } from "../DataStore";

export default class MongoDBDataStore implements DataStore {
  private client: MongoClient;
  private db: Db;

  private static readonly DATABASE_NAME = "crosswordcoach";
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
    /* Filter */
    const filter: Record<string, any> = {};
    if (options.source && options.dayOfWeek !== undefined) {
      // Filter by source and day of week
      filter.$and = [
        { [`sourcesToDaysOfWeek.${options.source}`]: { $exists: true } },
        { [`sourcesToDaysOfWeek.${options.source}`]: { $type: "array" } },
        { [`sourcesToDaysOfWeek.${options.source}`]: { $ne: [] } },
        { [`sourcesToDaysOfWeek.${options.source}`]: { $in: [options.dayOfWeek] } },
      ];
    } else if (options.source) {
      // Filter by source
      filter[`sourcesToDaysOfWeek.${options.source}`] = { $exists: true, $not: { $size: 0 } };
    } else if (options.dayOfWeek !== undefined) {
      throw new Error("Day-of-week-only filtering is not supported. Please provide a source.");
    }

    /* Sort */
    const sort: Record<string, 1 | -1> = {
      [options.orderBy]: options.orderDirection === "ASC" ? 1 : -1,
    };

    const entries = await this.db
      .collection<Entry>(MongoDBDataStore.ENTRIES_COLLECTION)
      .find(filter)
      .sort(sort)
      .skip(options.page * options.pageSize)
      .limit(options.pageSize)
      .toArray();

    return entries;
  }

  /**
   * Save a puzzle to the database.
   *
   * @param puzzle The puzzle to save
   */
  async savePuzzle(puzzle: CrosswordPuzzle): Promise<void> {
    await this.connect();

    /* Separate the entries from the puzzle metadata */
    const { entries, ...puzzleMetadata } = puzzle;
    const dayOfWeek = puzzleMetadata.date.getUTCDay();

    /* Insert entries */
    const entriesCollection = this.db.collection(MongoDBDataStore.ENTRIES_COLLECTION);
    await Promise.all(
      entries.map((entry: Entry) => {
        return entriesCollection.updateOne(
          /* Identify the entry by clue and answer */
          { clue: entry.clue, answer: entry.answer },
          /* Aggregation pipeline */
          [
            {
              $set: {
                clue: entry.clue,
                answer: entry.answer,
                sourcesToDaysOfWeek: {
                  $mergeObjects: [
                    "$sourcesToDaysOfWeek",
                    {
                      [puzzleMetadata.source]: {
                        $cond: [
                          { $isArray: { $ifNull: [`$sourcesToDaysOfWeek.${puzzleMetadata.source}`, null] } },
                          { $setUnion: [`$sourcesToDaysOfWeek.${puzzleMetadata.source}`, [dayOfWeek]] },
                          [dayOfWeek],
                        ],
                      },
                    },
                  ],
                },
              },
            },
          ],
          { upsert: true }
        );
      })
    );

    console.log(`Inserted puzzle ${puzzle.id} into the database`);
  }

  async deleteAll(): Promise<void> {
    await this.connect();
    await this.db.collection(MongoDBDataStore.ENTRIES_COLLECTION).deleteMany({});
    console.log("Deleted all entries from the database");
  }
}
