// Owner: Person B – demo helper page. Visit /demo before presenting.
"use client";

import { useState } from "react";
import Link from "next/link";
import { clearAllData, seedDemoData } from "@/lib/db/storage";

export default function DemoPage() {
  const [status, setStatus] = useState("");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Demo tools</h1>
      <p className="text-gray-600">Data lives in this browser only.</p>
      <div className="flex gap-3">
        <button
          onClick={() => { seedDemoData(); setStatus("Demo profile and one saved trip added."); }}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white"
        >
          Load demo data
        </button>
        <button
          onClick={() => { clearAllData(); setStatus("All data cleared."); }}
          className="rounded-lg border px-4 py-2"
        >
          Clear all data
        </button>
      </div>
      {status && <p className="text-sm">{status} <Link href="/trips" className="underline">Go to My trips</Link></p>}
    </section>
  );
}
