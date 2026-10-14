// Owner: Person B
// MVP data layer: everything is stored in the browser (localStorage). No login, no database.
// Only call these from client components ("use client"). On the server they return empty values.
// If we add Supabase later, only this file changes – keep the function names and types.
import { z } from "zod";
import {
  ProfileSchema,
  TripPlanSchema,
  TripRequestSchema,
  type Profile,
  type SavedTrip,
  type TripPlan,
  type TripRequest,
} from "@/lib/types";
import { mockPlan, mockProfile, mockRequest } from "@/lib/mock";

const PROFILE_KEY = "vp.profile";
const TRIPS_KEY = "vp.trips";

const SavedTripSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  request: TripRequestSchema,
  plan: TripPlanSchema,
});

function read(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked (private mode) – ignore, the demo keeps working in memory
  }
}

// ---- Profile ----

export function getProfile(): Profile | null {
  const parsed = ProfileSchema.safeParse(read(PROFILE_KEY));
  return parsed.success ? parsed.data : null;
}

export function saveProfile(profile: Profile): Profile {
  const valid = ProfileSchema.parse(profile); // throws if the form sends bad data
  write(PROFILE_KEY, valid);
  return valid;
}

// ---- Trips ----

export function listTrips(): SavedTrip[] {
  const parsed = z.array(SavedTripSchema).safeParse(read(TRIPS_KEY));
  return parsed.success ? parsed.data : [];
}

export function getTrip(id: string): SavedTrip | null {
  return listTrips().find((t) => t.id === id) ?? null;
}

export function saveTrip(request: TripRequest, plan: TripPlan): SavedTrip {
  const trip: SavedTrip = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    request: TripRequestSchema.parse(request),
    plan: TripPlanSchema.parse(plan),
  };
  write(TRIPS_KEY, [trip, ...listTrips()]);
  return trip;
}

export function deleteTrip(id: string) {
  write(TRIPS_KEY, listTrips().filter((t) => t.id !== id));
}

// ---- Demo helpers ----

/** Fills in a demo profile and one saved trip, so the demo never starts empty. */
export function seedDemoData() {
  saveProfile(mockProfile);
  if (listTrips().length === 0) saveTrip(mockRequest, mockPlan);
}

/** Wipes everything (handy before rehearsing the demo from scratch). */
export function clearAllData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.localStorage.removeItem(TRIPS_KEY);
}
