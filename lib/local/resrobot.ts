// Trafiklab ResRobot v2.1 – official public-transport journey planner for all of Sweden.
// Needs a free key from https://developer.trafiklab.se (RESROBOT_API_KEY). Without a key the source is skipped.
import type { LocalSource } from "./types";
import { sameCity } from "./city";

const API = "https://api.resrobot.se/v2.1";

type Stop = { extId: string; name: string };
type Leg = {
  type: string; // "JNY" = vehicle, "WALK"/"TRSF" = walking
  Origin: { name: string; time: string; date: string };
  Destination: { name: string; time: string };
  Product?: { name?: string; catOutL?: string } | { name?: string; catOutL?: string }[];
};
type Trip = { duration?: string; LegList: { Leg: Leg | Leg[] } };

const asArray = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** "PT1H5M" → "1 h 5 min" */
function prettyDuration(iso = ""): string {
  const h = /(\d+)H/.exec(iso)?.[1];
  const m = /(\d+)M/.exec(iso)?.[1];
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ") || "unknown time";
}

async function findStop(query: string, key: string, signal: AbortSignal): Promise<Stop | null> {
  const url = `${API}/location.name?input=${encodeURIComponent(query)}&type=S&maxNo=1&format=json&accessId=${key}`;
  const res = await fetch(url, { signal, next: { revalidate: 60 * 60 * 24 * 7 } });
  if (!res.ok) throw new Error(`ResRobot stop lookup HTTP ${res.status}`);
  const json = await res.json();
  return json.stopLocationOrCoordLocation?.[0]?.StopLocation ?? null;
}

function describeTrip(trip: Trip): string {
  const legs = asArray(trip.LegList.Leg);
  const rides = legs.filter((l) => l.type === "JNY");
  if (rides.length === 0) return "";
  const first = rides[0];
  const last = rides[rides.length - 1];
  const vehicles = rides
    .map((l) => asArray(l.Product)[0])
    .map((p) => p?.name || p?.catOutL)
    .filter(Boolean)
    .join(", then ");
  const changes = rides.length - 1;
  return `Departs ${first.Origin.time.slice(0, 5)} from ${first.Origin.name}, arrives ${last.Destination.time.slice(0, 5)} at ${last.Destination.name}; ${prettyDuration(trip.duration)}, ${changes} change${changes === 1 ? "" : "s"}; ${vehicles}.`;
}

/** Real public-transport options from where the traveller is staying to `destination` on the first trip day. */
export function resrobotJourney(destination: string): LocalSource {
  return {
    name: "Trafiklab ResRobot (Samtrafiken)",
    url: "https://www.trafiklab.se/api/our-apis/resrobot-v21/",
    async load({ profile, request, signal }) {
      const key = process.env.RESROBOT_API_KEY?.trim();
      if (!key || sameCity(profile.homeCity, destination)) return [];

      const [from, to] = await Promise.all([findStop(profile.homeCity, key, signal), findStop(destination, key, signal)]);
      if (!from || !to) return [];

      const url = `${API}/trip?originId=${from.extId}&destId=${to.extId}&date=${request.startDate}&time=09:00&numF=3&format=json&accessId=${key}`;
      const res = await fetch(url, { signal, next: { revalidate: 60 * 60 * 6 } });
      if (!res.ok) return []; // e.g. date outside the published timetable
      const trips = asArray<Trip>((await res.json()).Trip).map(describeTrip).filter(Boolean);
      if (trips.length === 0) return [];
      return [
        `Public transport ${from.name} → ${to.name} on ${request.startDate} (morning departures, timetable data):`,
        ...trips.map((t) => `- ${t}`),
      ];
    },
  };
}
