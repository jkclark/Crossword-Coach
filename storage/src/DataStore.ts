import { CrosswordPuzzle, Entry } from "common";

export interface DataStore {
  connect(): Promise<void>;

  close(): Promise<void>;

  getEntries(options: GetEntriesOptions): Promise<Entry[]>;

  savePuzzle(puzzle: CrosswordPuzzle): Promise<void>;
}

export interface GetEntriesOptions {
  /* Filter */

  /* Ordering */
  orderBy: string;
  orderDirection: string; // "ASC" or "DESC"

  /* Pagination */
  pageSize: number; // Number of entries to return
  page: number; // Page number (0-based)
}
