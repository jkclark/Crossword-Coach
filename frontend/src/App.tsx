import { useAtomValue } from "jotai";

import AnswerInput from "./components/AnswerInput";
import Navbar from "./components/Navbar";
import ScoreDisplay from "./components/ScoreDisplay";
import {
  currentEntryIndexAtom,
  currentEntryPageAtom,
  isLoadingEntriesAtom,
} from "./state";
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
        <div className="mb-3 w-full text-[clamp(1rem,5vw,2.5rem)] break-words">
          {allEntries[currentEntryPage][currentEntryIndex].clue} (
          {allEntries[currentEntryPage][currentEntryIndex].answer.length})
        </div>
        <AnswerInput
          key={`${currentEntryPage}-${currentEntryIndex}`}
          answer={allEntries[currentEntryPage][currentEntryIndex].answer}
        />
      </div>
    ) : null;

  const noEntriesLeftDiv = (
    <div className="text-4xl">There don't seem to be any clues left...</div>
  );

  const divToDisplay = isLoadingAtLeast1Second
    ? loadingDiv
    : entryDisplayDiv
      ? entryDisplayDiv
      : noEntriesLeftDiv;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex w-full flex-row justify-end px-4 pt-2">
        <ScoreDisplay />
      </div>
      <div className="container mx-auto flex flex-1 flex-col items-center justify-center text-center">
        {divToDisplay}
      </div>
    </div>
  );
}

export default App;
