// Owner: Person A
// Airbnb-style date range picker: two "Check-in / Check-out" boxes that open a two-month calendar.
// First click picks the start date, second click the end date. Dates are ISO strings ("2026-11-02").
"use client";

import { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayIso = () => {
  const t = new Date();
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
};
const pretty = (value: string) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
const nightsBetween = (a: string, b: string) =>
  Math.round((new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime()) / 86_400_000);

type Props = {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
};

export function DateRangePicker({ startDate, endDate, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState("");
  const now = new Date();
  const initial = startDate ? new Date(`${startDate}T12:00:00`) : now;
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });
  const ref = useRef<HTMLDivElement>(null);
  const today = todayIso();

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(day: string) {
    if (!startDate || endDate || day < startDate) {
      onChange(day, ""); // start a new range
    } else {
      onChange(startDate, day);
      setOpen(false);
    }
  }

  function shift(months: number) {
    const d = new Date(view.y, view.m + months, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  const canGoBack = view.y > now.getFullYear() || (view.y === now.getFullYear() && view.m > now.getMonth());
  const rangeEnd = endDate || (startDate && hover > startDate ? hover : "");
  const nights = startDate && endDate ? nightsBetween(startDate, endDate) : 0;

  function renderMonth(y: number, m: number) {
    const first = (new Date(y, m, 1).getDay() + 6) % 7; // Monday first
    const count = new Date(y, m + 1, 0).getDate();
    const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
    return (
      <div className="w-full">
        <p className="mb-3 text-center text-lg font-semibold">
          {new Date(y, m, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-7 text-center text-sm text-gray-500">
          {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            if (d === null) return <span key={`e${i}`} />;
            const day = iso(y, m, d);
            const past = day < today;
            const isEdge = day === startDate || day === endDate;
            const inRange = startDate && rangeEnd && day > startDate && day < rangeEnd;
            return (
              <div key={day} className={inRange ? "bg-emerald-50" : day === startDate && rangeEnd ? "rounded-l-full bg-emerald-50" : day === rangeEnd && startDate ? "rounded-r-full bg-emerald-50" : ""}>
                <button
                  type="button"
                  disabled={past}
                  onClick={() => pick(day)}
                  onMouseEnter={() => setHover(day)}
                  aria-label={pretty(day)}
                  aria-pressed={isEdge}
                  className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-base ${
                    past
                      ? "cursor-not-allowed text-gray-300 line-through"
                      : isEdge
                        ? "bg-emerald-700 font-bold text-white"
                        : "hover:border-2 hover:border-emerald-700"
                  }`}
                >
                  {d}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const next = new Date(view.y, view.m + 1, 1);
  const box = (active: boolean) =>
    `flex-1 rounded-xl px-4 py-3 text-left ${active ? "bg-white shadow-md ring-2 ring-emerald-700" : "hover:bg-gray-100"}`;

  return (
    <div ref={ref} className="relative">
      <div className="flex rounded-2xl border-2 border-gray-300 bg-gray-50 p-1">
        <button type="button" className={box(open && (!startDate || !!endDate))} onClick={() => setOpen(true)}>
          <span className="block text-sm font-bold uppercase tracking-wide">Check-in</span>
          <span className={`block text-lg ${startDate ? "" : "text-gray-500"}`}>{pretty(startDate) || "Add date"}</span>
        </button>
        <span className="my-2 w-px bg-gray-300" />
        <button type="button" className={box(open && !!startDate && !endDate)} onClick={() => setOpen(true)}>
          <span className="block text-sm font-bold uppercase tracking-wide">Check-out</span>
          <span className={`block text-lg ${endDate ? "" : "text-gray-500"}`}>{pretty(endDate) || "Add date"}</span>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-3xl border border-gray-200 bg-white p-5 shadow-xl" onMouseLeave={() => setHover("")}>
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} disabled={!canGoBack} aria-label="Previous month" className="h-10 w-10 rounded-full text-2xl hover:bg-gray-100 disabled:opacity-30">‹</button>
            <p className="text-base font-semibold text-gray-700">
              {startDate && !endDate ? "Select check-out date" : nights > 0 ? `${nights} night${nights === 1 ? "" : "s"}` : "Select check-in date"}
            </p>
            <button type="button" onClick={() => shift(1)} aria-label="Next month" className="h-10 w-10 rounded-full text-2xl hover:bg-gray-100">›</button>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {renderMonth(view.y, view.m)}
            <div className="hidden sm:block">
              {renderMonth(next.getFullYear(), next.getMonth())}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <button type="button" onClick={() => onChange("", "")} className="text-lg font-semibold underline">Clear dates</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-gray-900 px-5 py-2 text-lg font-semibold text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
