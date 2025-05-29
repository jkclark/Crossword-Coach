import type React from "react";
import EntryFilter from "./EntryFilter";

const Navbar: React.FC = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <a className="btn btn-ghost text-xl">Crossword Coach</a>
      </div>
      <div className="navbar-end">
        <EntryFilter />
      </div>
    </div>
  );
};

export default Navbar;
