import { CrosswordPuzzle, Entry } from "common";

export interface DataStore {
  connect(): Promise<void>;

  close(): Promise<void>;

  getEntries(options: GetEntriesOptions): Promise<Entry[]>;

  savePuzzle(puzzle: CrosswordPuzzle): Promise<void>;
}

export interface GetEntriesFilterOptions {
  /* Filtering */
  source?: string;
  dayOfWeek?: number;
  answerLength?: AnswerLengthRange;
}

export interface GetEntriesOptions extends GetEntriesFilterOptions {
  /* Ordering */
  orderBy: string;
  orderDirection: string; // "ASC" or "DESC"

  /* Pagination */
  pageSize: number; // Number of entries to return
  page: number; // Page number (0-based)
}

interface AnswerLengthRange {
  min: number; // Minimum length of the answer
  max: number; // Maximum length of the answer
}
