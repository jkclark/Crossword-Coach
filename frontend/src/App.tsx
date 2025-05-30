import { useAtomValue } from "jotai";

import AnswerInput from "./components/AnswerInput";
import Navbar from "./components/Navbar";
import { currentEntryIndexAtom, isLoadingEntriesAtom } from "./state";
import { useEntries } from "./useEntries";
import { useMinimumLoading } from "./useMinimumLoading";

function App() {
  const currentEntryIndex = useAtomValue(currentEntryIndexAtom);
  const isLoadingEntries = useAtomValue(isLoadingEntriesAtom);
  const allEntries = useEntries();

  const isLoadingAtLeast1Second = useMinimumLoading(isLoadingEntries, 1000);

  // Move the divs to variables
  const loadingDiv = (
    <div>
      <div className="text-3xl">Loading clues</div>
      <div className="loading loading-dots text-primary loading-xl"></div>
    </div>
  );

  const entryDisplayDiv =
    allEntries && currentEntryIndex >= 0 && currentEntryIndex < allEntries.length ? (
      <div>
        <div className="w-full text-[clamp(1rem,5vw,2.5rem)] break-words mb-3">
          {allEntries[currentEntryIndex].clue}
        </div>
        <AnswerInput key={currentEntryIndex} answer={allEntries[currentEntryIndex].answer} />
      </div>
    ) : null;

  const noEntriesLeftDiv = <div className="text-4xl">There don't seem to be any clues left...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container mx-auto text-center flex flex-col justify-center items-center flex-1">
        {isLoadingAtLeast1Second ? loadingDiv : entryDisplayDiv || noEntriesLeftDiv}
      </div>
    </div>
  );
}

export default App;
