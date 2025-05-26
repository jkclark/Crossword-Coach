import { useAtomValue } from "jotai";

import AnswerInput from "./components/AnswerInput";
import Navbar from "./components/Navbar";
import { currentEntryIndexAtom } from "./state";
import { useEntries } from "./useEntries";

function App() {
  const currentEntryIndex = useAtomValue(currentEntryIndexAtom);
  const allEntries = useEntries(currentEntryIndex);

  return (
    <>
      <Navbar />
      <div className="container mx-auto text-center">
        {allEntries && currentEntryIndex >= 0 && currentEntryIndex < allEntries.length && (
          <div>
            <div className="w-full text-[clamp(1rem,5vw,2.5rem)] break-words mb-3">
              {allEntries[currentEntryIndex].clue}
            </div>
            <AnswerInput key={currentEntryIndex} answer={allEntries[currentEntryIndex].answer} />
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
