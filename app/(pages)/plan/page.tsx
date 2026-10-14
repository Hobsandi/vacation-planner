// Owner: Person A
// Works end to end today with mock data: calls /api/plan and renders the result.
// TODO(A): replace mockProfile/mockRequest with the saved profile and a real form.
"use client";

import { useState } from "react";
import { mockProfile, mockRequest } from "@/lib/mock";
import type { TripPlan } from "@/lib/types";
import { TripPlanView } from "@/components/TripPlanView";

export default function PlanPage() {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function generate() {
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: mockProfile, request: mockRequest }),
    });
    setPlan(res.ok ? await res.json() : null);
    setLoading(false);
  }

  async function save() {
    if (!plan) return;
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: mockRequest, plan }),
    });
    setSaved(res.ok);
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Plan a trip</h1>
      <button onClick={generate} disabled={loading} className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white disabled:opacity-50">
        {loading ? "Planning your trip…" : "Plan my trip"}
      </button>
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
