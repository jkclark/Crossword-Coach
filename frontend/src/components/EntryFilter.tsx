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
      }
    }

    if (newLength - 1 < revealedLetters) {
      setRevealedLetters(newLength - 1);
    }
  };

  const updateRevealedLetters = (newCount: number) => {
    if (newCount > answerLengthMax - 1) {
      setRevealedLetters(answerLengthMax - 1);
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
      revealedLetters: revealedLetters > 0 ? revealedLetters : undefined,
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

          <h2 className="mb-2 text-lg">
            Answer length (TODO: add a little "i" icon that's hoverable)
          </h2>
          <div className="relative mb-2 flex w-full">
            <div className="mr-3 flex w-[3ch] flex-col justify-between">
              <div>min</div>
              <div>max</div>
            </div>
            <div className="flex flex-1 flex-col">
              <input
                type="range"
                min={MINIMUM_ANSWER_LENGTH}
                max={MAXIMUM_ANSWER_LENGTH}
                step={1}
                value={answerLengthMin}
                onChange={(e) => updateAnswerLengthMin(Number(e.target.value))}
                className="range range-primary w-full rounded-full"
              />
              <div className="mt-2 flex justify-between px-2.5 text-xs">
                {Array.from({
                  length: MAXIMUM_ANSWER_LENGTH - MINIMUM_ANSWER_LENGTH + 1,
                }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      width: "2ch", // 2 characters wide, enough for 2 digits
                      justifyContent: "center",
                      alignItems: "center",
                      fontVariantNumeric: "tabular-nums",
                      fontFamily: "inherit",
                    }}
                  >
                    {i + MINIMUM_ANSWER_LENGTH}
                  </span>
                ))}
              </div>
              <input
                type="range"
                min={MINIMUM_ANSWER_LENGTH}
                max={MAXIMUM_ANSWER_LENGTH}
                step={1}
                value={answerLengthMax}
                onChange={(e) => updateAnswerLengthMax(Number(e.target.value))}
                className="range range-primary mt-2 w-full rounded-full"
              />
            </div>
          </div>

          <br />

          <h2 className="mb-2 text-lg">
            Prefilled squares (TODO: add a little "i" icon that's hoverable)
          </h2>
          <div className="relative mb-2 flex w-full">
            <div className="mr-3 flex w-[3ch] flex-col justify-between">
              <div>set</div>
            </div>
            <div className="flex flex-1 flex-col">
              <input
                type="range"
                min={0}
                max={MAXIMUM_ANSWER_LENGTH - 1}
                step={1}
                value={revealedLetters}
                onChange={(e) => updateRevealedLetters(Number(e.target.value))}
                className="range range-primary w-full rounded-full"
              />
              <div className="mt-2 flex justify-between px-2.5 text-xs">
                {Array.from({
                  length: MAXIMUM_ANSWER_LENGTH,
                }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      width: "2ch", // 2 characters wide, enough for 2 digits
                      justifyContent: "center",
                      alignItems: "center",
                      fontVariantNumeric: "tabular-nums",
                      fontFamily: "inherit",
                    }}
                  >
                    {i}
                  </span>
                ))}
              </div>
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
