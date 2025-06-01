import { CrosswordPuzzle, Entry, getEmptyPuzzle } from "common/src/interfaces/CrosswordPuzzle";
import CrosswordPuzzleSource from "../crosswordPuzzleSource";

export default class NYTSource implements CrosswordPuzzleSource {
  BASE_PUZZLE_URL = "https://www.nytimes.com/svc/crosswords/v6/puzzle/daily/";
  static SOURCE_NAME = "NYT";

  private startDate: Date;
  private endDate: Date;
  private cookie: string; // Required for NYT request

  constructor(startDate: Date, endDate: Date, cookie: string) {
    this.startDate = startDate;
    this.endDate = endDate;

    if (!cookie) {
      throw new Error("NYTSource cannot be initialized without a cookie");
    }
    this.cookie = cookie;
  }

  async getAllPuzzleURLs(): Promise<string[]> {
    const puzzleURLs: string[] = [];

    const currentDate = this.startDate;
    while (currentDate <= this.endDate) {
      // Get the puzzle URL
      const puzzleURL = this.getPuzzleURLFromDate(currentDate);

      // Add the URL to the list
      puzzleURLs.push(puzzleURL);

      // Increment the date
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return puzzleURLs;
  }

  async getPuzzle(url: string): Promise<CrosswordPuzzle> {
    /* Fetch the puzzle data from the URL */
    const puzzleData: NYTPuzzleData = await this.getNYTPuzzleData(url);

    /* Parse the puzzle data to get the clue/answer pairs */
    const entries: Entry[] = this.getEntriesFromNYTPuzzleData(puzzleData);

    /* Create the CrosswordPuzzle object */
    const puzzle = getEmptyPuzzle();

    puzzle.id = this.getPuzzleIdFromURL(url);
    puzzle.date = this.getPuzzleDateFromURL(url);
    puzzle.source = NYTSource.SOURCE_NAME;
    puzzle.entries = entries;

    return puzzle;
  }

  filterThemeClues(puzzle: CrosswordPuzzle): CrosswordPuzzle {
    // TODO: Consider the `formatted` field
    // TODO: Never filter out anything from Friday or Saturday, as they're themeless
    return puzzle;
  }

  private getPuzzleURLFromDate(date: Date): string {
    return `${this.BASE_PUZZLE_URL}${date.toISOString().split("T")[0]}.json`;
  }

  private getPuzzleIdFromURL(url: string): string {
    const puzzleDate = this.getPuzzleDateFromURL(url);

    const puzzleYear = puzzleDate.getUTCFullYear();
    const puzzleMonth = String(puzzleDate.getUTCMonth() + 1).padStart(2, "0");
    const puzzleDay = String(puzzleDate.getUTCDate()).padStart(2, "0");

    const puzzleDateString = `${puzzleYear}-${puzzleMonth}-${puzzleDay}`;

    return `${NYTSource.SOURCE_NAME}-${puzzleDateString}`;
  }

  private getPuzzleDateFromURL(url: string): Date {
    const dateString = url.split("/").slice(-1)[0].split(".")[0];
    return new Date(dateString + "T00:00:00Z");
  }

  private async getNYTPuzzleData(url: string): Promise<NYTPuzzleData> {
    const response = await fetch(url, { headers: { cookie: this.cookie } });

    if (!response.ok) {
      throw new Error(`Failed to fetch puzzle data from ${url}: ${response.statusText}`);
    }

    const data = await response.json();

    const puzzleData: NYTPuzzleData = {
      cells: data.body[0].cells,
      clues: data.body[0].clues,
    };

    return puzzleData;
  }

  private getEntriesFromNYTPuzzleData(puzzleData: NYTPuzzleData): Entry[] {
    const entries: Entry[] = [];

    for (const clue of puzzleData.clues) {
      // Get the cell objects for the clue
      const cells = clue.cells.map((cellIndex) => puzzleData.cells[cellIndex]);

      // Get the answer from each cell object
      const answer = cells.map((cell) => cell.answer).join("");

      // Create the entry object
      const entry: Entry = {
        answer,
        clue: clue.text[0].plain,
      };

      // Add the entry to the list
      entries.push(entry);
    }

    return entries;
  }
}

interface NYTPuzzleData {
  cells: NYTPuzzleCell[];
  clues: NYTPuzzleClue[];
}

interface NYTPuzzleCell {
  answer: string;
}

interface NYTPuzzleClue {
  cells: number[];
  /* Standard puzzles have a "text" field that looks like this:
   * {
   *   "plain": "..."
   * }
   *
   * But when the puzzle has picture clues, the "text" field can look like this:
   * {
   *  "plain": "...",
   *  "formatted": "...",
   *
   * Sunday, January 26, 2025 and Sunday, April 27, 2025 are examples of this
   */
  text: { [textType: string]: string }[];
}
