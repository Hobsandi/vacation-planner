// Owner: Person A
"use client";

import { useEffect, useState } from "react";
import type { SavedTrip } from "@/lib/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    fetch("/api/trips").then((r) => r.json()).then(setTrips);
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">My trips</h1>
      {trips.length === 0 && <p className="text-gray-600">No saved trips yet.</p>}
      <ul className="space-y-3">
        {trips.map((t) => (
          <li key={t.id} className="rounded-lg border p-4">
            <p className="font-semibold">{t.plan.destination}</p>
            <p className="text-sm text-gray-600">
              {t.request.startDate} – {t.request.endDate} · {t.plan.transport.mode}, ~{t.plan.transport.co2Kg} kg CO₂ per person (estimate)
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
