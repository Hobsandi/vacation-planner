// Owner: Person A
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Profile, TripPlan, TripRequest } from "@/lib/types";
import { TripPlanView } from "@/components/TripPlanView";
import { getProfile, saveTrip } from "@/lib/db/storage";

const input = "w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg focus:border-emerald-600";

export default function PlanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checked, setChecked] = useState(false);
  const [request, setRequest] = useState<TripRequest>({ startDate: "", endDate: "", destination: "", travellers: 1 });
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    setChecked(true);
  }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    if (request.endDate < request.startDate) {
      setError("The end date must be after the start date.");
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);
    setPlan(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, request: { ...request, destination: request.destination || undefined } }),
      });
      if (!res.ok) throw new Error();
      setPlan(await res.json());
    } catch {
      setError("We couldn't plan your trip right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!plan) return;
    saveTrip({ ...request, destination: request.destination || undefined }, plan);
    setSaved(true);
  }

  if (!checked) return null;

  if (!profile) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-emerald-900">Plan a trip</h1>
        <p className="text-lg text-gray-700">Fill in your travel profile first so we can tailor the trip to you.</p>
        <Link href="/onboarding" className="inline-block rounded-xl bg-emerald-700 px-6 py-4 text-lg font-bold text-white hover:bg-emerald-800">
          Create my profile
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-900">Plan a trip, {profile.name}</h1>

      <form onSubmit={generate} className="grid gap-5 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-lg font-semibold">From</span>
          <input required type="date" className={input} value={request.startDate} onChange={(e) => setRequest({ ...request, startDate: e.target.value })} />
        </label>
        <label className="space-y-2">
          <span className="text-lg font-semibold">To</span>
          <input required type="date" className={input} value={request.endDate} onChange={(e) => setRequest({ ...request, endDate: e.target.value })} />
        </label>
        <label className="space-y-2">
          <span className="text-lg font-semibold">Destination</span>
          <input className={input} placeholder="Leave empty to be surprised" value={request.destination} onChange={(e) => setRequest({ ...request, destination: e.target.value })} />
        </label>
        <label className="space-y-2">
          <span className="text-lg font-semibold">Travellers</span>
          <input
            required
            type="number"
            min={1}
            className={input}
            value={request.travellers}
            onChange={(e) => setRequest({ ...request, travellers: Math.max(1, Math.round(Number(e.target.value))) })}
          />
        </label>
        <button type="submit" disabled={loading} className="rounded-xl bg-emerald-700 px-6 py-4 text-xl font-bold text-white hover:bg-emerald-800 disabled:opacity-50 sm:col-span-2">
          {loading ? "Planning your trip…" : "Plan my trip"}
        </button>
      </form>

      {error && <p className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-lg text-red-800">{error}</p>}

      {plan && (
        <>
          <TripPlanView plan={plan} />
          <button onClick={save} disabled={saved} className="rounded-xl border-2 border-emerald-700 bg-white px-6 py-3 text-lg font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60">
            {saved ? "Saved" : "Save trip"}
          </button>
        </>
      )}
    </section>
  );
}
