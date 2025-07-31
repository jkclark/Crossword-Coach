import type React from "react";
import EntryFilter from "./EntryFilter";
import ThemeToggle from "./ThemeToggle";

const Navbar: React.FC = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="btn btn-ghost pointer-events-none text-xl">
          Crossword Coach
        </div>
      </div>
      <div className="navbar-end">
        <div className="flex gap-2">
          <ThemeToggle />
          <EntryFilter />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
