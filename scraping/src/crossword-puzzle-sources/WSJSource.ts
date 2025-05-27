import * as cheerio from "cheerio";

import { CrosswordPuzzle, getEmptyPuzzle } from "@crosswordcoach/common";
import puppeteer from "puppeteer";
import CrosswordPuzzleSource from "../crosswordPuzzleSource";

export default class WSJSource implements CrosswordPuzzleSource {
  BASE_PUZZLES_PAGE_URL = "https://www.wsj.com/news/types/crossword";

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

  /**
   * Get all WSJ crossword puzzle URLs between the start and end dates.
   *
   * Because the WSJ uses these unpredictable IDs in the URL (see example
   * below), we have to fetch the page that lists the puzzles and extract the
   * URLs from there. The URLS listed there then return an HTML page that contains
   * the URL for the actual puzzle data.
   *
   * We paginate over all puzzles from the main puzzles page until we have spanned the
   * start -> end date range.
   *
   * Puzzle list page -> puzzle page -> puzzle data URL
   *
   * Example URLs:
   *  - https://www.wsj.com/puzzles/crossword/20250514/66925/data.json -- May 14
   *  - https://www.wsj.com/puzzles/crossword/20250520/67321/data.json -- May 20
   *  - https://www.wsj.com/puzzles/crossword/20250521/67322/data.json -- May 21
   *  - https://www.wsj.com/puzzles/crossword/20250522/67325/data.json -- May 22
   *  - https://www.wsj.com/puzzles/crossword/20250524/67326/data.json -- May 24
   *
   * @returns A list of URLs for the WSJ crossword puzzles between the start and end dates.
   */
  async getAllPuzzleURLs(): Promise<string[]> {
    /* Get the URL for each puzzle page */
    const puzzlePageURLs = await this.getPuzzlePageURLsFromPuzzlesListPageURL(this.BASE_PUZZLES_PAGE_URL);

    /* Get the URL for each puzzle's data from the puzzle-page HTML */
    const puzzleDataURLs = await this.getPuzzleDataURLsFromPuzzlePageURLs(puzzlePageURLs);

    return puzzleDataURLs;
  }

  async getPuzzle(url: string): Promise<CrosswordPuzzle> {
    const puzzle: CrosswordPuzzle = getEmptyPuzzle();
    return puzzle;
  }

  filterThemeClues(puzzle: CrosswordPuzzle): CrosswordPuzzle {
    return puzzle;
  }

  /**
   * Get the URLs for each puzzle page.
   *
   * We then need to fetch the puzzle page to be able to construct the actual
   * puzzle-data URL.
   *
   * Puzzle list page -> puzzle page -> puzzle data URL
   */
  async getPuzzlePageURLsFromPuzzlesListPageURL(puzzlesListPageURL: string): Promise<string[]> {
    const puzzlesListPageHTML = await this.getHTMLFromWSJ(puzzlesListPageURL);
    return this.getPuzzlePageURLsFromPuzzlesListPageHTML(puzzlesListPageHTML);
  }

  getPuzzlePageURLsFromPuzzlesListPageHTML(html: string): string[] {
    const puzzlePageURLs: string[] = [];
    const $ = cheerio.load(html);
    const puzzleListItems = $("html body #root ");
    return puzzlePageURLs;
  }

  async getPuzzleDataURLsFromPuzzlePageURLs(puzzlePageURLs: string[]): Promise<string[]> {
    const puzzleDataURLs: string[] = [];

    await Promise.all(
      puzzlePageURLs.map(async (puzzlePageURL) => {
        /* Get the puzzle-data URL from the puzzle page */
        const puzzleDataURL = await this.getPuzzleDataURLFromPuzzlePageURL(puzzlePageURL);

        /* Add the puzzle-data URL to the list if it exists */
        if (puzzleDataURL) {
          puzzleDataURLs.push(puzzleDataURL);
        }
      })
    );

    return puzzleDataURLs;
  }

  /**
   * Get the puzzle-data URL given the puzzle-page URL.
   */
  async getPuzzleDataURLFromPuzzlePageURL(puzzlePageURL: string): Promise<string> {
    const puzzlePageHTML = await this.getHTMLFromWSJ(puzzlePageURL);
    return this.getPuzzleDataURLFromPuzzlePageHTML(puzzlePageHTML);
  }

  /**
   * Get the puzzle-data URL given the puzzle-page HTML.
   */
  async getPuzzleDataURLFromPuzzlePageHTML(html: string): Promise<string> {
    return "";
  }

  async getHTMLFromWSJ(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({ Cookie: this.cookie });

    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
    });
    const html = await page.content();

    await browser.close();
    return html;
  }
}
