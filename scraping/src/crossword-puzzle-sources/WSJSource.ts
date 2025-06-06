/**
 * I have a sheet called "WSJ IDs" in my Scratchpad Google Sheet
 * that lays out 2 months of WSJ puzzle IDs:
 * https://docs.google.com/spreadsheets/d/1ELaP9_MewlN594xXJmlrpk5iN2wmjOn-MU7giEQpxoM/edit?gid=260395729#gid=260395729
 */
import { CrosswordPuzzle, Entry, getEmptyPuzzle } from "@crosswordcoach/common";
import CrosswordPuzzleSource, { CrosswordPuzzleSourceOnTheFly } from "../crosswordPuzzleSource";

export default class WSJSource implements CrosswordPuzzleSource, CrosswordPuzzleSourceOnTheFly {
  BASE_PUZZLE_URL = "https://www.wsj.com/puzzles/crossword/";
  static SOURCE_NAME = "WSJ";

  private startDate: Date;
  private startId: number;
  private endDate: Date;
  private cookie: string; // Required for WSJ request

  constructor(startDate: Date, startId: number, endDate: Date, cookie: string) {
    this.startDate = startDate;
    this.startId = startId;
    this.endDate = endDate;

    if (!cookie) {
      throw new Error("WSJSource cannot be initialized without a cookie");
    }
    this.cookie = cookie;
  }

  async *getAllPuzzles(): AsyncGenerator<CrosswordPuzzle> {
    for await (const puzzle of this.getWeekOfPuzzles(this.startDate, this.startId)) {
      yield puzzle;
    }
  }

  async getPuzzle(url: string): Promise<CrosswordPuzzle> {
    const puzzle: CrosswordPuzzle = getEmptyPuzzle();

    let puzzleData: Entry[];
    try {
      puzzleData = await this.getWSJPuzzleEntries(url);
    } catch (error) {
      throw new Error(`Failed to fetch WSJ puzzle data from ${url}`);
    }

    puzzle.id = this.getPuzzleIdFromURL(url);
    puzzle.date = this.getPuzzleDateFromURL(url);
    puzzle.source = WSJSource.SOURCE_NAME;
    puzzle.entries = puzzleData;

    return puzzle;
  }

  filterThemeClues(puzzle: CrosswordPuzzle): CrosswordPuzzle {
    return puzzle;
  }

  private getPuzzleURLFromDateAndId(date: Date, id: number): string {
    return `${this.BASE_PUZZLE_URL}${date.toISOString().slice(0, 10).replace(/-/g, "")}/${id}/data.json`;
  }

  private async *getWeekOfPuzzles(startDate: Date, startId: number): AsyncGenerator<CrosswordPuzzle> {
    const WEEK_ID_RANGE = 5;
    const DAYS_OF_WEEK_NO_PUZZLE = [5, 7]; // There are no puzzles on Fridays and Sundays
    const currentDate = new Date(startDate);

    /* Get the starting puzzle (which should guaranteed exist) */
    const puzzleURL = this.getPuzzleURLFromDateAndId(currentDate, startId);
    yield await this.getPuzzle(puzzleURL);

    /* Track the used IDs to avoid guessing the same ID twice */
    const usedIds = new Set<number>();
    usedIds.add(startId);

    /* Increment the date to the next day */
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);

    /* For the remaining puzzles (until the next Sunday), guess the IDs */
    while (currentDate.getUTCDay() !== 0) {
      // Skip Fridays and Sundays
      if (DAYS_OF_WEEK_NO_PUZZLE.includes(currentDate.getUTCDay())) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        continue;
      }

      console.log(`SEARCHing day of week: ${currentDate.getUTCDay()} (${currentDate.toISOString()})`);

      try {
        // Guess the ID
        const { wsjId, puzzle } = await this.getPuzzleByGuessing(
          currentDate,
          startId,
          usedIds,
          WEEK_ID_RANGE
        );

        // Yield the puzzle
        yield puzzle;

        // Mark the ID as used
        usedIds.add(wsjId);
      } catch (error) {
        console.error(`ERROR: Could not find ID for puzzle with date ${currentDate.toISOString()}`);
      } finally {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
    }
  }

  /**
   * Find a puzzle with a given date by guessing its WSJ ID.
   *
   * We search for the puzzle by guessing IDs within a certain range of a starting ID,
   * ignoring the starting ID. For example, with range = 5 and startId of 100, we would guess
   * IDs 95 - 105, excluding 100. If any of those IDs return a valid puzzle for the given date,
   * we return that puzzle.
   *
   * @param date the date of the puzzle to fetch
   * @param middleId the ID to guess around
   * @param usedIds IDs to ignore (because they've already been used)
   * @param range the maximum distance from startId to guess
   * @returns a puzzle with its WSJ ID
   */
  private async getPuzzleByGuessing(
    date: Date,
    middleId: number,
    usedIds: Set<number>,
    range: number
  ): Promise<PuzzleWithWSJId> {
    /* Build all candidate IDs */
    const guessIds: number[] = [];
    for (let offset = 1; offset <= range; offset++) {
      if (!usedIds.has(middleId + offset)) guessIds.push(middleId + offset);
      if (!usedIds.has(middleId - offset)) guessIds.push(middleId - offset);
    }

    /* Map each guess to a promise */
    const guessPromises = guessIds.map(async (guessId) => {
      const puzzleURL = this.getPuzzleURLFromDateAndId(date, guessId);
      const puzzle = await this.getPuzzle(puzzleURL);
      return { wsjId: guessId, puzzle };
    });

    try {
      // Promise.any resolves with the first fulfilled promise
      return await Promise.any(guessPromises);
    } catch {
      throw new Error(`Could not find puzzle with date ${date.toISOString()} by guessing IDs`);
    }
  }

  private getPuzzleIdFromURL(url: string): string {
    const puzzleDate = this.getPuzzleDateFromURL(url);

    const puzzleYear = puzzleDate.getUTCFullYear();
    const puzzleMonth = String(puzzleDate.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const puzzleDay = String(puzzleDate.getUTCDate()).padStart(2, "0");

    const puzzleDateString = `${puzzleYear}-${puzzleMonth}-${puzzleDay}`;

    return `${WSJSource.SOURCE_NAME}-${puzzleDateString}`;
  }

  private getPuzzleDateFromURL(url: string): Date {
    const dateMatch = url.match(/(\d{4}\d{2}\d{2})/);

    const year = dateMatch ? dateMatch[1].slice(0, 4) : "";
    const month = dateMatch ? dateMatch[1].slice(4, 6) : "";
    const day = dateMatch ? dateMatch[1].slice(6, 8) : "";

    if (year && month && day) {
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    throw new Error(`Unable to determine date from URL: ${url}`);
  }

  private async getWSJPuzzleEntries(url: string): Promise<Entry[]> {
    const response = await fetch(url, { headers: { cookie: this.cookie } });

    if (!response.ok) {
      throw new Error(`Failed to fetch WSJ puzzle data from ${url}`);
    }

    const responseJson = await response.json();

    const entries: Entry[] = [];
    const clues = responseJson.data.copy.clues;
    const acrossClues = clues[0].clues;
    const downClues = clues[1].clues;

    for (const acrossEntry of acrossClues) {
      const entry: Entry = {
        clue: acrossEntry.clue,
        answer: acrossEntry.answer,
      };
      entries.push(entry);
    }

    for (const downEntry of downClues) {
      const entry: Entry = {
        clue: downEntry.clue,
        answer: downEntry.answer,
      };
      entries.push(entry);
    }

    return entries;
  }
}

interface PuzzleWithWSJId {
  wsjId: number;
  puzzle: CrosswordPuzzle;
}
