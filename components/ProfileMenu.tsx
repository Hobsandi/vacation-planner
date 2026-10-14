// Owner: Person A
// Profile icon in the top-right corner with a small settings menu.
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAllData, getProfile, seedDemoData } from "@/lib/db/storage";
import { setLargeText, useLargeText } from "@/components/TextSize";
import { ChevronDownIcon, RefreshIcon, SuitcaseIcon, TextSizeIcon, TrashIcon, UserIcon } from "@/components/icons";

const base = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left";
const item = `${base} hover:bg-emerald-50 focus-visible:bg-emerald-50`;

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const large = useLargeText();
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Re-read the profile on every page change, so the initials update right after onboarding.
  useEffect(() => {
    setName(getProfile()?.name || null);
    setOpen(false);
  }, [pathname]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = name
    ?.split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function loadDemo() {
    seedDemoData();
    setName(getProfile()?.name || null);
    setOpen(false);
    router.push("/trips");
  }

  function clearData() {
    if (!window.confirm("Delete your profile and all saved trips from this browser?")) return;
    clearAllData();
    setName(null);
    setOpen(false);
    router.push("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Profile and settings"
        className="flex items-center gap-1.5 rounded-full p-1 pr-2 hover:bg-white/10"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-300 font-bold text-emerald-950 ring-2 ring-white/70">
          {initials || <UserIcon className="h-6 w-6" />}
        </span>
        <ChevronDownIcon className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-3 w-72 rounded-2xl border border-stone-200 bg-white p-2 text-base text-gray-900 shadow-xl">
          <div className="border-b border-stone-100 px-3 pb-3 pt-2">
            <p className="font-semibold">{name ?? "Welcome"}</p>
            <p className="text-sm text-gray-600">{name ? "Your travel profile" : "No profile yet"}</p>
          </div>
          <div className="py-2">
            <Link role="menuitem" href="/onboarding" className={item}>
              <UserIcon className="h-5 w-5 text-emerald-700" />
              {name ? "Edit profile" : "Create profile"}
            </Link>
            <Link role="menuitem" href="/trips" className={item}>
              <SuitcaseIcon className="h-5 w-5 text-emerald-700" />
              My trips
            </Link>
          </div>
          <div className="border-t border-stone-100 py-2">
            <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Settings</p>
            <button role="menuitemcheckbox" aria-checked={large} type="button" onClick={() => setLargeText(!large)} className={item}>
              <TextSizeIcon className="h-5 w-5 text-emerald-700" />
              <span className="flex-1">Larger text</span>
              <span className={`relative h-6 w-11 rounded-full transition-colors ${large ? "bg-emerald-600" : "bg-stone-300"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${large ? "left-[22px]" : "left-0.5"}`} />
              </span>
            </button>
            <button role="menuitem" type="button" onClick={loadDemo} className={item}>
              <RefreshIcon className="h-5 w-5 text-emerald-700" />
              Load demo data
            </button>
            <button role="menuitem" type="button" onClick={clearData} className={`${base} text-red-700 hover:bg-red-50 focus-visible:bg-red-50`}>
              <TrashIcon className="h-5 w-5" />
              Clear my data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
