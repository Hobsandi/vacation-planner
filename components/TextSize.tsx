// Owner: Person A
// Larger text for older travellers. Turned on automatically for age 65+ and toggled in the nav.
"use client";

import { useEffect, useState } from "react";

const KEY = "vp.largeText";
export const LARGE_TEXT_AGE = 65;

function apply(large: boolean) {
  document.documentElement.classList.toggle("large-text", large);
}

export function setLargeText(large: boolean) {
  try {
    localStorage.setItem(KEY, large ? "1" : "0");
  } catch {
    // storage blocked – the setting just won't be remembered
  }
  apply(large);
  window.dispatchEvent(new Event("vp-text-size"));
}

function readLargeText() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function TextSizeToggle() {
  const [large, setLarge] = useState(false);

  useEffect(() => {
    const sync = () => {
      const value = readLargeText();
      setLarge(value);
      apply(value);
    };
    sync();
    window.addEventListener("vp-text-size", sync);
    return () => window.removeEventListener("vp-text-size", sync);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setLargeText(!large)}
      aria-pressed={large}
      className="rounded-full border-2 border-emerald-700 px-4 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-50"
    >
      {large ? "Normal text" : "Larger text"}
    </button>
  );
}
