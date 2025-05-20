export interface CrosswordPuzzle {
  id: string;
  date: Date;
  source: string; // e.g., "NYT", "LAT"
  words: { [clue: string]: string };
}
