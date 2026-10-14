// Owner: Person A
// One saved trip, with everything the AI generated for it.
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { SavedTrip } from "@/lib/types";
import { deleteTrip, getTrip } from "@/lib/db/storage";
import { TripPlanView } from "@/components/TripPlanView";

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setTrip(getTrip(id));
    setChecked(true);
  }, [id]);

  function remove() {
    if (!confirm("Delete this trip?")) return;
    deleteTrip(id);
    router.push("/trips");
  }

  if (!checked) return null;

  if (!trip) {
    return (
      <section className="space-y-4">
        <h1 className="font-serif text-4xl font-bold text-emerald-950">Trip not found</h1>
        <Link href="/trips" className="font-semibold text-emerald-800 underline">← Back to my trips</Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link href="/trips" className="text-lg font-semibold text-emerald-800 underline">← My trips</Link>
      <p className="text-lg text-gray-700">
        {trip.request.startDate} – {trip.request.endDate} · saved{" "}
        {new Date(trip.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>
      <TripPlanView plan={trip.plan} />
      <button
        onClick={remove}
        className="rounded-xl border-2 border-red-300 bg-white px-6 py-3 text-lg font-semibold text-red-700 hover:bg-red-50"
      >
        Delete trip
      </button>
    </section>
  );
}
