import { useSetAtom } from "jotai";
import { useRef, useState } from "react";
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

  const openModal = () => {
    const modal = document.getElementById("my_modal_1") as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
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
  };

  return (
    <>
      <button className="btn" onClick={openModal}>
        Settings
      </button>
      <dialog id="my_modal_1" className="modal">
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
              <button className="btn bg-primary text-primary-content" onClick={applyFilters}>
                Apply
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="!cursor-default">Close</button>
        </form>
      </dialog>
    </>
  );
};

export default EntryFilter;
