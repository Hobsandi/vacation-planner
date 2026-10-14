// Owner: Person A
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { getProfile, saveProfile } from "@/lib/db/storage";
import { LARGE_TEXT_AGE, setLargeText } from "@/components/TextSize";
import { ArrowRightIcon } from "@/components/icons";

const INTERESTS = ["food", "hiking", "museums", "beaches", "nightlife", "old towns", "nature", "shopping"];
const input = "w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-lg focus:border-emerald-600";
const choice = (on: boolean) =>
  `rounded-xl border-2 px-5 py-3 text-lg font-medium capitalize ${on ? "border-emerald-700 bg-emerald-700 text-white" : "border-gray-300 bg-white hover:border-emerald-600"}`;

export default function OnboardingPage() {
  const router = useRouter();
  // Age is required in the form; it stays empty until the user types it.
  const [age, setAge] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [profile, setProfile] = useState<Profile>({
    name: "",
    homeCity: "",
    budgetPerPersonEur: 800,
    travelStyle: "balanced", // no longer asked; the AI adapts the pace to the traveller's age
    interests: [],
    needs: "",
    sustainability: "high", // no longer asked; the whole app favours low-CO₂ travel
  });

  // Prefill if the user already has a saved profile.
  useEffect(() => {
    const saved = getProfile();
    if (saved) {
      setProfile(saved);
      if (saved.age) setAge(String(saved.age));
    }
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

  function addCustomInterest() {
    const interest = customInterest.trim().toLowerCase();
    if (interest && !profile.interests.includes(interest)) update("interests", [...profile.interests, interest]);
    setCustomInterest("");
  }

  // Preset interests plus anything the user typed themselves.
  const interestOptions = [...INTERESTS, ...profile.interests.filter((i) => !INTERESTS.includes(i))];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ageNumber = Math.round(Number(age));
    saveProfile({ ...profile, age: ageNumber });
    if (ageNumber >= LARGE_TEXT_AGE) setLargeText(true);
    router.push("/plan");
  }

  return (
    <form onSubmit={submit} className="space-y-8 rounded-3xl bg-white p-6 shadow-sm sm:p-10">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-bold text-emerald-950">Your travel profile</h1>
        <p className="text-lg text-gray-700">A few questions so we can plan a trip that suits you.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-lg font-semibold">Name</span>
          <input required className={input} value={profile.name} onChange={(e) => update("name", e.target.value)} />
        </label>

        <label className="block space-y-2">
          <span className="text-lg font-semibold">Age</span>
          <input
            required
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            className={input}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-lg font-semibold">Home city</span>
          <input required className={input} value={profile.homeCity} onChange={(e) => update("homeCity", e.target.value)} />
        </label>

        <label className="block space-y-2">
          <span className="text-lg font-semibold">Budget per person (€)</span>
          <input
            required
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            className={input}
            value={profile.budgetPerPersonEur}
            onChange={(e) => update("budgetPerPersonEur", Math.max(1, Math.round(Number(e.target.value))))}
          />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold">Interests</legend>
        <div className="flex flex-wrap gap-3">
          {interestOptions.map((i) => (
            <button key={i} type="button" aria-pressed={profile.interests.includes(i)} onClick={() => toggleInterest(i)} className={choice(profile.interests.includes(i))}>
              {i}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input
            aria-label="Add your own interest"
            className={input}
            placeholder="Something else? E.g. gardens, jazz, bird watching"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomInterest();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustomInterest}
            className="shrink-0 rounded-xl border-2 border-emerald-700 bg-white px-5 py-3 text-lg font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            Add
          </button>
        </div>
      </fieldset>

      <label className="block space-y-2">
        <span className="text-lg font-semibold">Special needs (optional)</span>
        <input
          className={input}
          placeholder="Walking aid, step-free access, vegetarian…"
          value={profile.needs ?? ""}
          onChange={(e) => update("needs", e.target.value)}
        />
      </label>

      <button type="submit" className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-700 px-6 py-4 text-xl font-bold text-white hover:bg-emerald-800 sm:w-auto">
        Save and plan a trip <ArrowRightIcon className="h-6 w-6" />
      </button>
    </form>
  );
}
