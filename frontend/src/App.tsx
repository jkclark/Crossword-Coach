import { useAtomValue } from "jotai";
import React from "react";

import AnswerInput from "./components/AnswerInput";
import ExplanationDisplay from "./components/ExplanationDisplay";
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

  /* On page load, before everything gets going, isLoadingAtLeast1Second will be false,
   * and allEntries will be empty. Without the `firstLoadDone` flag, we'd show the "no entries left"
   * div, which isn't what we want. This state allows us to show the loading div until the first load
   * is complete. Otherwise, if (not loading AND no entries), we'll show the "no more entries" display.
   */
  const [firstLoadDone, setFirstLoadDone] = React.useState(false);
  const prevLoadingRef = React.useRef(isLoadingAtLeast1Second);
  React.useEffect(() => {
    if (
      prevLoadingRef.current && // was loading before
      !isLoadingAtLeast1Second && // now not loading
      !firstLoadDone // only set once
    ) {
      setFirstLoadDone(true);
    }
    prevLoadingRef.current = isLoadingAtLeast1Second;
  }, [isLoadingAtLeast1Second, firstLoadDone]);

  /* Divs to display based on loading state and entries */
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
        <ExplanationDisplay
          explanation={
            allEntries[currentEntryPage][currentEntryIndex].explanation ||
            "NO EXPLANATION"
          }
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
      : !firstLoadDone
        ? loadingDiv
        : noEntriesLeftDiv;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex w-full flex-row justify-end px-4 pt-2">
        <ScoreDisplay />
      </div>
      {/* Arbitrarily set the top margin to 20vh to put the content in the "middle top ish"*/}
      <div className="container mx-auto mt-[20vh] flex flex-1 flex-col items-center text-center">
        {divToDisplay}
      </div>
    </div>
  );
}

export default App;
