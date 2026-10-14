// Server-only. Local, destination-specific data that is added to the AI prompt.
// To add a city: create lib/local/<city>.ts exporting a CityProvider and list it in CITIES below.
import type { Profile, TripRequest } from "@/lib/types";
import type { CityProvider } from "./types";
import { cityKey } from "./city";
import { uppsala } from "./uppsala";

const CITIES: CityProvider[] = [uppsala];

const SOURCE_TIMEOUT_MS = 5000; // a slow API must never block the plan

export type LocalData = {
  city: string;
  facts: string; // ready to paste into the prompt
  sources: { name: string; url: string }[]; // only sources that returned something
};

export function findCity(destination: string): CityProvider | undefined {
  const key = cityKey(destination);
  return CITIES.find((c) => c.names.includes(key));
}

/** Fetches every source for the destination in parallel. Returns null when the city has no local data. */
export async function getLocalData(profile: Profile, request: TripRequest): Promise<LocalData | null> {
  const city = findCity(request.destination);
  if (!city) return null;

  const results = await Promise.all(
    city.sources.map(async (source) => {
      try {
        const facts = await source.load({ profile, request, signal: AbortSignal.timeout(SOURCE_TIMEOUT_MS) });
        return { source, facts };
      } catch (e) {
        console.warn(`[local] ${city.city} / ${source.name} skipped:`, (e as Error).message);
        return { source, facts: [] as string[] };
      }
    }),
  );

  const used = results.filter((r) => r.facts.length > 0);
  if (used.length === 0) return null;
  return {
    city: city.city,
    facts: used.map((r) => `[${r.source.name}]\n${r.facts.join("\n")}`).join("\n\n"),
    sources: used.map((r) => ({ name: r.source.name, url: r.source.url })),
  };
}
