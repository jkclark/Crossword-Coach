import { useAtom } from "jotai";

import { useEffect } from "react";
import puzzleData from "../../temp/puzzles/NYT-2023-01-01.json";
import AnswerInput from "./components/AnswerInput";
import Navbar from "./components/Navbar";
import { allEntriesAtom, currentEntryIndexAtom } from "./state";

function App() {
  const [allEntries, setAllEntries] = useAtom(allEntriesAtom);
  const [currentEntryIndex, setCurrentEntryIndex] = useAtom(currentEntryIndexAtom);

  // Temporarily use the puzzle data from the JSON file
  useEffect(() => {
    setAllEntries(puzzleData.entries);
  }, [setAllEntries]);

  const handleNext = () => {
    setCurrentEntryIndex((prevIndex) => (prevIndex + 1) % puzzleData.entries.length);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto text-center">
        {allEntries && currentEntryIndex >= 0 && currentEntryIndex < allEntries.length && (
          <div>
            <div className="text-4xl">{puzzleData.entries[currentEntryIndex].clue}</div>
            <AnswerInput answer={puzzleData.entries[currentEntryIndex].answer} />
            <button className="btn">Enter</button>
            <button className="btn" onClick={handleNext}>
              Next
            </button>
          </div>
        )}
        {(allEntries.length === 0 || currentEntryIndex >= allEntries.length) && (
          <div className="text-4xl">There don't seem to be any clues left...</div>
        )}
      </div>
    </>
  );
}

export default App;
