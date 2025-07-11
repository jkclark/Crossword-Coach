import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";

// DaisyUI themes
const THEMES = {
  light: "nord",
  dark: "business",
};

<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  strokeWidth={1.5}
  stroke="currentColor"
  className="size-6"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
  />
</svg>;

function getDefaultTheme() {
  // Use prefers-color-scheme to determine default
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return THEMES.dark;
  }
  return THEMES.light;
}

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<string>(getDefaultTheme());

  useEffect(() => {
    /* On mount, check for existing theme on <html> */
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    if (current) {
      setTheme(current);
    } else {
      html.setAttribute("data-theme", theme);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newTheme = theme === THEMES.light ? THEMES.dark : THEMES.light;
    html.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  };

  return (
    <button className="btn" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === THEMES.light ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  );
};

export default ThemeToggle;
