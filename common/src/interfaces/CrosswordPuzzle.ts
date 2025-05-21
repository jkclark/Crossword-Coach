export interface CrosswordPuzzle {
  id: string;
  date: Date;
  source: string; // e.g., "NYT", "LAT"
  entries: Entry[];
}

export interface Entry {
  clue: string;
  answer: string;
}

export function getEmptyPuzzle(): CrosswordPuzzle {
  return {
    id: "",
    date: new Date(),
    source: "",
    entries: [],
  };
}
