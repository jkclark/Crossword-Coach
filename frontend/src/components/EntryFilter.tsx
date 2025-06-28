import { useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { entryFilterOptionsAtom } from "../state";

const EntryFilter: React.FC = () => {
  const setEntryFilterOptions = useSetAtom(entryFilterOptionsAtom);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | null>(null);

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

  const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

  const applyFilters = () => {
    setEntryFilterOptions({
      source: selectedSource !== null ? selectedSource : undefined,
      dayOfWeek: selectedDayOfWeek !== null ? selectedDayOfWeek : undefined,
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
          <h1 className="mb-4 font-bold text-2xl">Filter</h1>
          <h2 className="mb-2 text-lg">Publication</h2>
          <form className="filter flex flex-row gap-y-1">
            <input className="btn btn-square" type="reset" value="×" onClick={() => setSource(null)} />
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
          <h2 className="mb-2 bold text-lg">Day of the week</h2>
          <form ref={dayOfWeekFormRef} className="filter flex flex-row gap-y-1">
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
              <button className="btn bg-primary text-primary-content" onClick={applyFilters} type="button">
                Apply
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="!cursor-default" onClick={closeModal} type="button">
            Close
          </button>
        </form>
      </dialog>
    </>
  );
};

export default EntryFilter;
