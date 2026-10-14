// Owner: Person A
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SavedTrip } from "@/lib/types";
import { listTrips } from "@/lib/db/storage";

export default function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    setTrips(listTrips());
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="font-serif text-4xl font-bold text-emerald-950">My trips</h1>
      {trips.length === 0 && (
        <p className="text-gray-700">
          No saved trips yet. <Link href="/plan" className="font-semibold text-emerald-800 underline">Plan a trip</Link>
        </p>
      )}
      <ul className="space-y-3">
        {trips.map((t) => (
          <li key={t.id} className="rounded-2xl border-2 border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-xl font-semibold">{t.plan.destination}</p>
            <p className="text-gray-700">
              {t.request.startDate} – {t.request.endDate} · {t.plan.transport.mode}, ~{t.plan.transport.co2Kg} kg CO₂ per person (estimate)
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
