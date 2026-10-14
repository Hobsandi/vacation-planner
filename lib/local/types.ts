// Server-only. Shapes shared by every city's local data sources.
import type { Profile, TripRequest } from "@/lib/types";

export type LocalContext = {
  profile: Profile;
  request: TripRequest;
  signal: AbortSignal; // aborted when the source takes too long
};

/** One API (or group of endpoints) we credit in the plan, e.g. "Uppsala kommun öppna data". */
export type LocalSource = {
  name: string;
  url: string; // shown to the traveller as the source
  /** Short, plain-text facts for the AI. Return [] when there is nothing relevant. Throwing is fine – the source is skipped. */
  load: (ctx: LocalContext) => Promise<string[]>;
};

/** A destination with local data. Add a file per city and list it in lib/local/index.ts. */
export type CityProvider = {
  city: string; // display name, e.g. "Uppsala"
  names: string[]; // lowercase names the destination may use, e.g. ["uppsala"]
  sources: LocalSource[];
};
