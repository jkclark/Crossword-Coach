export interface CrosswordPuzzle {
  id: string;
  date: Date;
  source: string; // e.g., "NYT", "LAT"
  entries: Entry[];
}

export interface Entry {
  clue: string;
  answer: string;
  explanation?: string; // Will be present if an explanation has previously been requested
}

export function getEmptyPuzzle(): CrosswordPuzzle {
  return {
    id: "",
    date: new Date(),
    source: "",
    entries: [],
  };
}
