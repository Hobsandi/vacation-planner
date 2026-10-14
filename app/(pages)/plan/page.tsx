// Owner: Person A
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Profile, TripPlan, TripRequest } from "@/lib/types";
import { TripPlanView } from "@/components/TripPlanView";
import { loadProfile } from "@/components/profileStorage";

const input = "w-full rounded-lg border px-3 py-2";

export default function PlanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checked, setChecked] = useState(false);
  const [request, setRequest] = useState<TripRequest>({ startDate: "", endDate: "", destination: "", travellers: 1 });
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
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

  async function save() {
    if (!plan) return;
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: { ...request, destination: request.destination || undefined }, plan }),
    });
    setSaved(res.ok);
  }

  if (!checked) return null;

  if (!profile) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Plan a trip</h1>
        <p className="text-gray-600">Fill in your travel profile first so we can tailor the trip to you.</p>
        <Link href="/onboarding" className="inline-block rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white">
          Create my profile
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Plan a trip, {profile.name}</h1>

      <form onSubmit={generate} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="font-medium">From</span>
          <input required type="date" className={input} value={request.startDate} onChange={(e) => setRequest({ ...request, startDate: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className="font-medium">To</span>
          <input required type="date" className={input} value={request.endDate} onChange={(e) => setRequest({ ...request, endDate: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className="font-medium">Destination</span>
          <input className={input} placeholder="Leave empty to be surprised" value={request.destination} onChange={(e) => setRequest({ ...request, destination: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className="font-medium">Travellers</span>
          <input
            required
            type="number"
            min={1}
            className={input}
            value={request.travellers}
            onChange={(e) => setRequest({ ...request, travellers: Math.max(1, Math.round(Number(e.target.value))) })}
          />
        </label>
        <button type="submit" disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white disabled:opacity-50 sm:col-span-2">
          {loading ? "Planning your trip…" : "Plan my trip"}
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

      {plan && (
        <>
          <TripPlanView plan={plan} />
          <button onClick={save} disabled={saved} className="rounded-lg border px-5 py-2">
            {saved ? "Saved" : "Save trip"}
          </button>
        </>
      )}
    </section>
  );
}
