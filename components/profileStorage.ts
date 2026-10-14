// Owner: Person A
// Keeps the profile in the browser until Person B has Supabase login ready.
import { ProfileSchema, type Profile } from "@/lib/types";

const KEY = "vp-profile";

export function saveProfile(profile: Profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function loadProfile(): Profile | null {
  try {
    const parsed = ProfileSchema.safeParse(JSON.parse(localStorage.getItem(KEY) ?? "null"));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
