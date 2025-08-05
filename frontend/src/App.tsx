import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";

import AnswerInput from "./components/AnswerInput";
import ExplanationDisplay from "./components/ExplanationDisplay";
import Navbar from "./components/Navbar";
import ScoreDisplay from "./components/ScoreDisplay";
import { explanationAtom, isLoadingEntriesAtom } from "./state";
import { useAutoUpdateEntries } from "./useAutoUpdateEntries";
import { useEntries } from "./useEntries";
import { useExplanation } from "./useExplanation";
import { useMinimumLoading } from "./useMinimumLoading";

function App() {
  /* For loading animations */
  const isLoadingEntries = useAtomValue(isLoadingEntriesAtom);
  const MINIMUM_LOADING_TIME = 1000;
  const isLoadingAtLeast1Second = useMinimumLoading(
    isLoadingEntries,
    MINIMUM_LOADING_TIME,
  );

  /* Current entry */
  const { currentEntry } = useEntries();

  /* Set up the useEffect's for automatically updating entries and progress */
  useAutoUpdateEntries();

  /* Explanation */
  const explanation = useAtomValue(explanationAtom);
  const { showOrFetchExplanation } = useExplanation(currentEntry);

  /* On page load, before everything gets going, isLoadingAtLeast1Second will be false,
   * and allEntries will be empty. Without the `firstLoadDone` flag, we'd show the "no entries left"
   * div, which isn't what we want. This state allows us to show the loading div until the first load
  );
   * is complete. Otherwise, if (not loading AND no entries), we'll show the "no more entries" display.
   */
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const prevLoadingRef = useRef(isLoadingAtLeast1Second);
  useEffect(() => {
    if (
      prevLoadingRef.current && // was loading before
      !isLoadingAtLeast1Second && // now not loading
      !firstLoadDone // only set once
    ) {
      setFirstLoadDone(true);
    }
    prevLoadingRef.current = isLoadingAtLeast1Second;
  }, [isLoadingAtLeast1Second, firstLoadDone]);

  // Animation state for sliding
  const [displayedEntry, setDisplayedEntry] = useState(currentEntry);
  const [animating, setAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"in" | "out" | null>(
    null,
  );
  const prevEntryKey = useRef<string | null>(null);

  /*** Sliding code below ***/

  /* Helper to get a unique key for the entry */
  const getEntryKey = (entry: typeof currentEntry) =>
    entry ? `${entry.clue}-${entry.answer}` : "";

  const SLIDE_DURATION = 400;

  /* When currentEntry changes, trigger slide out, then update, then slide in */
  useEffect(() => {
    const newKey = getEntryKey(currentEntry);

    /* First render */
    if (prevEntryKey.current === null) {
      setDisplayedEntry(currentEntry);
      setSlideDirection("in");
      setAnimating(false);
      prevEntryKey.current = newKey;
      return;
    }

    /* Every other render */
    if (newKey !== prevEntryKey.current) {
      // Initiate slide out
      setSlideDirection("out");
      setAnimating(true);

      // After slide out, update entry and slide in
      const timeout = setTimeout(() => {
        setDisplayedEntry(currentEntry);
        setSlideDirection("in");
        setAnimating(true);

        prevEntryKey.current = newKey;

        // After slide in, stop animating
        setTimeout(() => {
          setAnimating(false);
        }, SLIDE_DURATION);
      }, SLIDE_DURATION); // match CSS duration
      return () => clearTimeout(timeout);
    }

    // eslint-disable-next-line
  }, [currentEntry]);

  /* CSS classes for sliding animation */
  const getSlideClass = () => {
    if (!animating && slideDirection === "in") return "slide-in-done";
    if (!animating && slideDirection === "out") return "slide-out-done";
    if (animating && slideDirection === "in") return "slide-in";
    if (animating && slideDirection === "out") return "slide-out";
    return "";
  };

  /*** Sliding code above ***/

  /* Divs to display based on loading state and entries */
  const loadingDiv = (
    <div>
      <div className="text-3xl">Loading clues</div>
      <div className="loading loading-dots text-primary loading-xl"></div>
    </div>
  );

  const entryDisplayDiv = displayedEntry ? (
    <div
      className={`slide-container ${getSlideClass()}`}
      key={getEntryKey(displayedEntry)}
    >
      <div className="mb-3 w-full text-[clamp(1rem,5vw,2.5rem)] break-words">
        {displayedEntry.clue} ({displayedEntry.answer.length})
      </div>
      <AnswerInput
        key={`${displayedEntry.clue}-${displayedEntry.answer}`}
        answer={displayedEntry.answer}
        showOrFetchExplanation={showOrFetchExplanation}
        inputDisabled={animating}
      />
      <ExplanationDisplay explanation={explanation} />
    </div>
  ) : null;

  const noEntriesLeftDiv = (
    <div className="text-4xl">There don't seem to be any clues left...</div>
  );

  /**
   * Priority of divs:
   * 1. First load not done yet? Loading div
   * 2. Entry display div is truthy? Entry display div
   * 3. currentEntry (but not displayedEntry) or Loading entries? Loading div
   * 4. No entries left
   */
  const divToDisplay = !firstLoadDone
    ? loadingDiv
    : entryDisplayDiv
      ? entryDisplayDiv
      : isLoadingAtLeast1Second || currentEntry
        ? loadingDiv
        : noEntriesLeftDiv;

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="mt-2 mb-10 flex h-[20%] w-full flex-row items-end justify-end">
        <ScoreDisplay />
      </div>
      {/* Arbitrarily set the top margin to 20vh to put the content in the "middle top ish"*/}
      <div className="container mx-auto flex flex-col items-center overflow-hidden text-center">
        {divToDisplay}
      </div>
    </div>
  );
}

export default App;
