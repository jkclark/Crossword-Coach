import { useSetAtom } from "jotai";
import { useState } from "react";
import { entryFilterOptionsAtom } from "../state";

const EntryFilter: React.FC = () => {
  const setEntryFilterOptions = useSetAtom(entryFilterOptionsAtom);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number | null>(null);

  const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const openModal = () => {
    const modal = document.getElementById("my_modal_1") as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  const setSource = (newSource: string | null) => {
    setSelectedSource(newSource);
  };

  const setDayOfWeek = (newDayOfWeek: number | null) => {
    setSelectedDayOfWeek(newDayOfWeek);
  };

  const applyFilters = () => {
    setEntryFilterOptions({
      source: selectedSource,
      dayOfWeek: selectedDayOfWeek,
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
            <input
              className={`btn ${selectedSource === "NYT" ? "btn-primary" : ""}`}
              type="radio"
              name="sources"
              aria-label="New York Times"
              onClick={() => setSource("NYT")}
            />
            <input
              className="btn"
              type="radio"
              name="sources"
              aria-label="Wall Street Journal"
              onClick={() => {
                setSource("WSJ");
              }}
            />
          </form>
          <br />
          <h2 className="mb-2 bold text-lg">Day of the week</h2>
          <form className="filter flex flex-row gap-y-1">
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
              <button className="btn bg-primary" onClick={applyFilters}>
                Apply
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default EntryFilter;
