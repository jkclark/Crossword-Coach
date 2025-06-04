// import * as cheerio from "cheerio";

import { CrosswordPuzzle, Entry, getEmptyPuzzle } from "@crosswordcoach/common";
// import puppeteer from "puppeteer";
import CrosswordPuzzleSource from "../crosswordPuzzleSource";

export default class WSJSource implements CrosswordPuzzleSource {
  BASE_PUZZLES_PAGE_URL = "https://www.wsj.com/news/types/crossword";
  static SOURCE_NAME = "WSJ";

  private startDate: Date;
  private endDate: Date;
  private cookie: string; // Required for WSJ request

  constructor(startDate: Date, endDate: Date, cookie: string) {
    this.startDate = startDate;
    this.endDate = endDate;

    if (!cookie) {
      throw new Error("WSJSource cannot be initialized without a cookie");
    }
    this.cookie = cookie;
  }

  async *getAllPuzzles(): AsyncGenerator<CrosswordPuzzle> {
    // TODO: Get date, puzzle ID, source
    // TODO: Get entries from WSJ puzzle data
    // TODO: Put crossword puzzle object together from above
    // TODO: If date is a Sunday (or Friday...?), skip this date
    // TODO: If puzzle ID yields 404 or other error, increase ID
    const url = "https://www.wsj.com/puzzles/crossword/20250603/67854/data.json";
    yield await this.getPuzzle(url);
  }

  async getAllPuzzleURLs(): Promise<string[]> {
    return [];
  }

  async getPuzzle(url: string): Promise<CrosswordPuzzle> {
    const puzzle: CrosswordPuzzle = getEmptyPuzzle();

    let puzzleData: Entry[];
    try {
      puzzleData = await this.getWSJPuzzleEntries(url);
    } catch (error) {
      console.error(`Error fetching WSJ puzzle data from ${url}:`, error);
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

  private getPuzzleIdFromURL(url: string): string {
    const puzzleDate = this.getPuzzleDateFromURL(url);

    const puzzleYear = puzzleDate.getUTCFullYear();
    const puzzleMonth = String(puzzleDate.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const puzzleDay = String(puzzleDate.getUTCDate()).padStart(2, "0");

    const puzzleDateString = `${puzzleYear}${puzzleMonth}${puzzleDay}`;

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

    const data = await response.json();

    const entries: Entry[] = [];

    for (const acrossEntry of data.copy.clues[0].clues) {
      const entry: Entry = {
        clue: acrossEntry.clue,
        answer: acrossEntry.answer,
      };
      console.log(`Adding entry: ${entry.clue} = ${entry.answer}`);
      entries.push(entry);
    }

    for (const downEntry of data.copy.clues[1].clues) {
      const entry: Entry = {
        clue: downEntry.clue,
        answer: downEntry.answer,
      };
      entries.push(entry);
    }

    return entries;
  }
}
