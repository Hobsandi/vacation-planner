// Owner: Person A
// TODO(B): sign-up/login with Supabase before this step, then save the profile in the database.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { loadProfile, saveProfile } from "@/components/profileStorage";

const INTERESTS = ["food", "hiking", "museums", "beaches", "nightlife", "old towns", "nature", "shopping"];
const input = "w-full rounded-lg border px-3 py-2";

export default function OnboardingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    name: "",
    homeCity: "",
    budgetPerPersonEur: 800,
    travelStyle: "balanced",
    interests: [],
    needs: "",
    sustainability: "high",
  });

  // Prefill if the user already has a saved profile.
  useEffect(() => {
    const saved = loadProfile();
    if (saved) setProfile(saved);
  }, []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function toggleInterest(interest: string) {
    update(
      "interests",
      profile.interests.includes(interest)
        ? profile.interests.filter((i) => i !== interest)
        : [...profile.interests, interest],
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveProfile(profile);
    router.push("/plan");
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <h1 className="text-2xl font-bold">Your travel profile</h1>

      <label className="block space-y-1">
        <span className="font-medium">Name</span>
        <input required className={input} value={profile.name} onChange={(e) => update("name", e.target.value)} />
      </label>

      <label className="block space-y-1">
        <span className="font-medium">Home city</span>
        <input required className={input} value={profile.homeCity} onChange={(e) => update("homeCity", e.target.value)} />
      </label>

      <label className="block space-y-1">
        <span className="font-medium">Budget per person (€)</span>
        <input
          required
          type="number"
          min={1}
          step={1}
          className={input}
          value={profile.budgetPerPersonEur}
          onChange={(e) => update("budgetPerPersonEur", Math.max(1, Math.round(Number(e.target.value))))}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="font-medium">Travel style</legend>
        <div className="flex gap-2">
          {(["relaxed", "balanced", "adventurous"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update("travelStyle", s)}
              className={`rounded-lg border px-4 py-2 capitalize ${profile.travelStyle === s ? "border-emerald-600 bg-emerald-50" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-medium">Interests</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleInterest(i)}
              className={`rounded-full border px-3 py-1 text-sm ${profile.interests.includes(i) ? "border-emerald-600 bg-emerald-50" : ""}`}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1">
        <span className="font-medium">Special needs (optional)</span>
        <input
          className={input}
          placeholder="Vegetarian, wheelchair access, travelling with kids…"
          value={profile.needs ?? ""}
          onChange={(e) => update("needs", e.target.value)}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="font-medium">How much should we prioritise low CO₂?</legend>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update("sustainability", s)}
              className={`rounded-lg border px-4 py-2 capitalize ${profile.sustainability === s ? "border-emerald-600 bg-emerald-50" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white">
        Save and plan a trip
      </button>
    </form>
  );
}
