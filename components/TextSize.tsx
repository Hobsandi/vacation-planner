// Owner: Person A
// Larger text for older travellers. Turned on automatically for age 65+ and toggled in the profile menu.
"use client";

import { useEffect, useState } from "react";

const KEY = "vp.largeText";
const EVENT = "vp-text-size";
export const LARGE_TEXT_AGE = 65;

function apply(large: boolean) {
  document.documentElement.classList.toggle("large-text", large);
}

function readLargeText() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLargeText(large: boolean) {
  try {
    localStorage.setItem(KEY, large ? "1" : "0");
  } catch {
    // storage blocked – the setting just won't be remembered
  }
  apply(large);
  window.dispatchEvent(new Event(EVENT));
}

/** Current text-size setting; also applies it to the page on first load. */
export function useLargeText() {
  const [large, setLarge] = useState(false);

  useEffect(() => {
    const sync = () => {
      const value = readLargeText();
      setLarge(value);
      apply(value);
    };
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  return large;
}
