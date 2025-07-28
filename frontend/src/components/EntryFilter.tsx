import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  answerLengthMaxAtom,
  answerLengthMinAtom,
  entryFilterOptionsAtom,
  MAXIMUM_ANSWER_LENGTH,
  MINIMUM_ANSWER_LENGTH,
  revealedLettersAtom,
} from "../state";
import MiniAnswerDisplay from "./MiniAnswerDisplay";
import NumberStepper from "./NumberStepper";

const EntryFilter: React.FC = () => {
  const setEntryFilterOptions = useSetAtom(entryFilterOptionsAtom);

  /* Revealed letters */
  const [revealedLetters, setRevealedLetters] = useAtom(revealedLettersAtom);

  /* Answer length */
  const [answerLengthMin, setAnswerLengthMin] = useAtom(answerLengthMinAtom);
  const [answerLengthMax, setAnswerLengthMax] = useAtom(answerLengthMaxAtom);
  /* Source and day of week */
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | null>(
    null,
  );

  // NOTE: TS is being annoying with allowing me to import a runtime value from
  // the scraping package. So I'm just duplicating it here.
  const SOURCES = [
    {
      name: "New York Times",
      shortName: "NYT",
    },
    {
      name: "Wall Street Journal",
      shortName: "WSJ",
    },
  ];

  const DAYS_OF_WEEK = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Required to let us reset the day-of-the-week form when the source is reset
  const dayOfWeekFormRef = useRef<HTMLFormElement>(null);

  // Ref for the Settings button in order to remove focus when closing the modal
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  // Ref for the dialog in order to remove focus when closing the modal
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Lose focus on the Settings button when the modal closes
  const blurSettingsButton = () => {
    settingsButtonRef.current?.blur();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.addEventListener("close", blurSettingsButton);
    return () => {
      dialog.removeEventListener("close", blurSettingsButton);
    };
  }, []);

  const openModal = () => {
    const modal = dialogRef.current;
    if (modal) {
      modal.showModal();
    }
  };

  const closeModal = () => {
    const modal = dialogRef.current;
    if (modal) {
      modal.close();
    }
    blurSettingsButton();
  };

  const setSource = (newSource: string | null) => {
    if (!newSource) {
      setSelectedSource(null);
      setSelectedDayOfWeek(null); // Reset day of week when source is cleared
      dayOfWeekFormRef.current?.reset(); // Reset the day-of-the-week form to clear radio buttons
      return;
    }

    setSelectedSource(newSource);
  };

  const setDayOfWeek = (newDayOfWeek: number | null) => {
    setSelectedDayOfWeek(newDayOfWeek);
  };

  const updateAnswerLengthMin = (newLength: number) => {
    if (newLength < MINIMUM_ANSWER_LENGTH) {
      setAnswerLengthMin(MINIMUM_ANSWER_LENGTH);
    } else if (newLength > MAXIMUM_ANSWER_LENGTH) {
      setAnswerLengthMin(MAXIMUM_ANSWER_LENGTH);
    } else {
      setAnswerLengthMin(newLength);

      // Make sure max is at least as large as min
      if (newLength > answerLengthMax) {
        setAnswerLengthMax(newLength);
      }
    }

    // Make sure revealed letters is at most as large as min - 1
    if (newLength - 1 < revealedLetters) {
      setRevealedLetters(newLength - 1);
    }
  };

  const updateAnswerLengthMax = (newLength: number) => {
    if (newLength < MINIMUM_ANSWER_LENGTH) {
      setAnswerLengthMax(MINIMUM_ANSWER_LENGTH);
    } else if (newLength > MAXIMUM_ANSWER_LENGTH) {
      setAnswerLengthMax(MAXIMUM_ANSWER_LENGTH);
    } else {
      setAnswerLengthMax(newLength);

      // Make sure min is at most as large as max
      if (newLength < answerLengthMin) {
        setAnswerLengthMin(newLength);

        // If we're updating answerLengthMin, we also need to make sure
        // revealed letters is valid (no greater than answerLengthMin - 1)
        if (newLength - 1 < revealedLetters) {
          setRevealedLetters(newLength - 1);
        }
      }
    }
  };

  const updateRevealedLetters = (newCount: number) => {
    if (newCount > answerLengthMin - 1) {
      setRevealedLetters(answerLengthMin - 1);
    } else {
      setRevealedLetters(newCount);
    }
  };

  const applyFilters = () => {
    setEntryFilterOptions({
      source: selectedSource !== null ? selectedSource : undefined,
      dayOfWeek: selectedDayOfWeek !== null ? selectedDayOfWeek : undefined,
      answerLength:
        // Only include answer length if either min or max is changed
        // from the default values
        answerLengthMin !== MINIMUM_ANSWER_LENGTH ||
        answerLengthMax !== MAXIMUM_ANSWER_LENGTH
          ? {
              min: answerLengthMin,
              max: answerLengthMax,
            }
          : undefined,
    });
    closeModal(); // Close and blur after applying
  };

  return (
    <>
      <button className="btn" onClick={openModal} ref={settingsButtonRef}>
        Settings
      </button>
      <dialog id="my_modal_1" className="modal" ref={dialogRef}>
        <div className="modal-box max-w-3xl">
          <h1 className="mb-4 text-2xl font-bold">Filter</h1>

          <h2 className="mb-2 text-lg">Answer settings</h2>
          <div className="relative mb-2 flex w-full justify-between">
            <div className="flex max-w-1/3 flex-1 basis-1/3 flex-col items-center">
              <div>Min</div>
              <NumberStepper
                value={answerLengthMin}
                incrementEnabled={true}
                onIncrement={() => updateAnswerLengthMin(answerLengthMin + 1)}
                decrementEnabled={true}
                onDecrement={() => updateAnswerLengthMin(answerLengthMin - 1)}
              />
              <MiniAnswerDisplay length={answerLengthMin} />
            </div>
            <div className="flex max-w-1/3 flex-1 basis-1/3 flex-col items-center">
              <div>Max</div>
              <NumberStepper
                value={answerLengthMax}
                incrementEnabled={true}
                onIncrement={() => updateAnswerLengthMax(answerLengthMax + 1)}
                decrementEnabled={true}
                onDecrement={() => updateAnswerLengthMax(answerLengthMax - 1)}
              />
              <MiniAnswerDisplay length={answerLengthMax} />
            </div>
            <div className="flex max-w-1/3 flex-1 basis-1/3 flex-col items-center">
              <div>Prefilled</div>
              <NumberStepper
                value={revealedLetters}
                incrementEnabled={revealedLetters < answerLengthMin - 1}
                onIncrement={() => updateRevealedLetters(revealedLetters + 1)}
                decrementEnabled={revealedLetters > 0}
                onDecrement={() => updateRevealedLetters(revealedLetters - 1)}
              />
              <MiniAnswerDisplay
                length={revealedLetters + 1}
                revealedIndexes={[...Array(revealedLetters).keys()]}
              />
            </div>
          </div>

          <br />

          <h2 className="mb-2 text-lg">Publication</h2>
          <form className="flex flex-row gap-y-1 filter">
            <input
              className="btn btn-square"
              type="reset"
              value="×"
              onClick={() => setSource(null)}
            />
            {SOURCES.map((source, index) => (
              <input
                key={index}
                className={`btn ${selectedSource === source.shortName ? "btn-primary" : ""}`}
                type="radio"
                name="sources"
                aria-label={source.name}
                onClick={() => setSource(source.shortName)}
              />
            ))}
          </form>

          <br />

          <h2 className="bold mb-2 text-lg">Day of the week</h2>
          <form ref={dayOfWeekFormRef} className="flex flex-row gap-y-1 filter">
            <input
              className="btn btn-square"
              type="reset"
              value="×"
              onClick={() => setSelectedDayOfWeek(null)}
            />
            {DAYS_OF_WEEK.map((day, index) => (
              <input
                key={index}
                className={`btn ${selectedDayOfWeek === index ? "btn-primary" : ""}`}
                type="radio"
                name="daysOfWeek"
                aria-label={day}
                onClick={() => setDayOfWeek(index)}
                disabled={!selectedSource}
              />
            ))}
          </form>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button
                className="btn bg-primary text-primary-content"
                onClick={applyFilters}
                type="button"
              >
                Apply
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            className="!cursor-default"
            onClick={closeModal}
            type="button"
          >
            Close
          </button>
        </form>
      </dialog>
    </>
  );
};

export default EntryFilter;
