import { useAtomValue } from "jotai";

import AnswerInput from "./components/AnswerInput";
import Navbar from "./components/Navbar";
import ScoreDisplay from "./components/ScoreDisplay";
import { currentEntryIndexAtom, currentEntryPageAtom, isLoadingEntriesAtom } from "./state";
import { useEntries } from "./useEntries";
import { useMinimumLoading } from "./useMinimumLoading";

function App() {
  const currentEntryIndex = useAtomValue(currentEntryIndexAtom);
  const currentEntryPage = useAtomValue(currentEntryPageAtom);
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
    allEntries &&
    currentEntryPage !== undefined &&
    currentEntryPage >= 0 &&
    Object.keys(allEntries).includes(currentEntryPage.toString()) &&
    currentEntryIndex !== undefined &&
    currentEntryIndex >= 0 &&
    currentEntryIndex < allEntries[currentEntryPage].length ? (
      <div>
        <div className="w-full text-[clamp(1rem,5vw,2.5rem)] break-words mb-3">
          {allEntries[currentEntryPage][currentEntryIndex].clue}
        </div>
        <AnswerInput
          key={`${currentEntryPage}-${currentEntryIndex}`}
          answer={allEntries[currentEntryPage][currentEntryIndex].answer}
        />
      </div>
    ) : null;

  const noEntriesLeftDiv = <div className="text-4xl">There don't seem to be any clues left...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-row w-full justify-end px-4 pt-2">
        <ScoreDisplay />
      </div>
      <div className="container mx-auto text-center flex flex-col justify-center items-center flex-1">
        {entryDisplayDiv ? entryDisplayDiv : isLoadingAtLeast1Second ? loadingDiv : noEntriesLeftDiv}
      </div>
    </div>
  );
}

export default App;
