import { useAtom } from "jotai";

import puzzleData from "../../temp/puzzles/NYT-2023-01-01.json";
import AnswerInput from "./components/AnswerInput";
import Navbar from "./components/Navbar";
import { currentEntryIndexAtom } from "./state";

function App() {
  const [currentEntryIndex, setCurrentEntryIndex] = useAtom(currentEntryIndexAtom);

  const handleNext = () => {
    setCurrentEntryIndex((prevIndex) => (prevIndex + 1) % puzzleData.entries.length);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto text-center">
        <div className="text-4xl">{puzzleData.entries[currentEntryIndex].clue}</div>
        <AnswerInput answer={puzzleData.entries[currentEntryIndex].answer} />
        <button className="btn">Enter</button>
        <button className="btn" onClick={handleNext}>
          Next
        </button>
      </div>
    </>
  );
}

export default App;
