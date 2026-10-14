// Owner: Person C. Server-only – never import this from a client component.
// Uses Groq's free, OpenAI-compatible API (https://console.groq.com) via plain fetch – no extra package.
import { TripPlanSchema, type Profile, type TripPlan, type TripRequest } from "@/lib/types";
import { mockPlan } from "@/lib/mock";
import { getLocalData } from "@/lib/local";
import { sameCity } from "@/lib/local/city";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Any model listed at https://console.groq.com/docs/models works here.
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const FALLBACK_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "llama-3.1-8b-instant"];

const SYSTEM_PROMPT = `You are a sustainable-travel planner for a webapp whose theme is "a better tomorrow".
Plan ONE trip that genuinely fits the traveller's profile and request.

Rules:
- profile.homeCity is where the traveller is currently staying; the trip starts and ends there.
- If the request has "alreadyAtDestination": true, the traveller is already in the destination city: plan local days only, with no journey there or back, and OMIT "transport" and "alternativeTransport".
- Number of days = number of calendar days from startDate to endDate, inclusive. One entry per day.
- Prefer train or bus when the journey is realistic (roughly under 10 hours). Use a flight only if there is no sensible alternative.
- Respect sustainability: "high" = strongly prefer low-CO₂ options and off-season/less crowded places; "low" = comfort first.
- Respect the traveller's budget (budgetPerPersonEur), travel style, interests and any special needs. Plan for one traveller.
- If age is given, adapt the pace: travellers around 65+ get fewer, calmer activities per day, short walking distances, step-free/accessible options, rest time and comfortable direct connections (fewer changes). Younger travellers can have a busier schedule.
- Consider the season of the dates (weather, opening times).
- If the user message contains "Local data", it comes from official local APIs. Build the days around those real places, trails and walks where they fit the profile, and use their exact names. If a public-transport route is given, base "transport" on it (times, changes, vehicles). Mention relevant traffic disruptions in the activities or tips. Never invent places that sound official – prefer the local data.
- Activities are short, concrete phrases (3–5 per day). Include travel on the first and last day (unless already at the destination).
- co2Kg = estimated kg CO₂ per person for the ROUND trip. Rough factors per passenger-km: train 0.03, bus 0.03, ferry 0.12, car 0.17, flight 0.20.
- alternativeTransport = the higher-CO₂ option the traveller avoided (usually a flight). Omit it if there is none.
- All prices and CO₂ figures are estimates.

Reply with ONLY a JSON object, no markdown, with exactly these keys:
{
  "destination": "City, Country",
  "pitch": "1–2 sentences on why this fits the profile",
  "days": [{ "day": 1, "title": "short title", "activities": ["..."] }],
  "transport": { "mode": "train|bus|car|ferry|flight", "description": "...", "co2Kg": 0 },
  "alternativeTransport": { "mode": "train|bus|car|ferry|flight", "description": "...", "co2Kg": 0 },
  "estimatedCostPerPersonEur": 0,
  "sustainabilityTips": ["..."]
}`;

export async function generatePlan(profile: Profile, request: TripRequest): Promise<TripPlan> {
  // No key yet? Return the mock so the rest of the team is never blocked.
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return mockPlan;

  const atDestination = sameCity(profile.homeCity, request.destination);
  // Real places, routes and disruptions from local APIs (only for cities in lib/local).
  const local = await getLocalData(profile, request);
  const userPrompt =
    `Profile: ${JSON.stringify(profile)}\nRequest: ${JSON.stringify({ ...request, alreadyAtDestination: atDestination })}` +
    (local ? `\n\nLocal data for ${local.city}:\n${local.facts}` : "");
  // Try the configured model first, then fall back if Groq has retired it or it misbehaves.
  const models = [...new Set([MODEL, ...FALLBACK_MODELS])];
  const errors: string[] = [];

  for (const model of models) {
    let res: Response;
    try {
      res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey.trim()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          temperature: 0.6,
          max_tokens: 2500,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      });
    } catch (e) {
      errors.push(`${model}: network error ${(e as Error).message}`);
      continue;
    }

    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      errors.push(`${model}: Groq ${res.status} ${body}`);
      if (res.status === 401 || res.status === 403) break; // bad key – other models won't help
      continue;
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    try {
      const raw = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      const plan = normalize(raw);
      if (atDestination) {
        // Never suggest how to travel to the city the traveller is already in.
        delete plan.transport;
        delete plan.alternativeTransport;
      }
      const parsed = TripPlanSchema.safeParse(plan);
      if (parsed.success) return local ? { ...parsed.data, localSources: local.sources } : parsed.data;
      errors.push(`${model}: invalid plan ${JSON.stringify(parsed.error.issues).slice(0, 300)}`);
    } catch (e) {
      errors.push(`${model}: unparsable output ${(e as Error).message.slice(0, 100)}`);
    }
  }

  console.error("[ai] generatePlan failed:", errors.join(" | "));
  throw new PlanError("Could not generate a plan right now. Please try again.", errors.join(" | "));
}

export class PlanError extends Error {
  detail: string;
  constructor(message: string, detail: string) {
    super(message);
    this.detail = detail;
  }
}

const MODES = ["train", "bus", "car", "ferry", "flight"] as const;

/** Fixes the small format slips open models make (numbers as strings, odd mode names, nulls). */
function normalize(raw: Record<string, unknown>): Record<string, unknown> {
  const num = (v: unknown) => {
    if (typeof v === "number") return v;
    const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };
  const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
  const transport = (t: unknown) => {
    if (!t || typeof t !== "object") return undefined;
    const o = t as Record<string, unknown>;
    const m = str(o.mode).toLowerCase();
    const mode =
      MODES.find((x) => m.includes(x)) ??
      (m.includes("plane") || m.includes("air") ? "flight" : m.includes("boat") ? "ferry" : m.includes("coach") ? "bus" : "train");
    return { mode, description: str(o.description), co2Kg: Math.round(num(o.co2Kg)) };
  };
  const days = Array.isArray(raw.days) ? raw.days : [];
  const alt = transport(raw.alternativeTransport);
  return {
    destination: str(raw.destination),
    pitch: str(raw.pitch),
    days: days.map((d, i) => {
      const o = (d ?? {}) as Record<string, unknown>;
      return {
        day: i + 1,
        title: str(o.title),
        activities: Array.isArray(o.activities) ? o.activities.map(str) : [],
      };
    }),
    ...(transport(raw.transport) ? { transport: transport(raw.transport) } : {}),
    ...(alt ? { alternativeTransport: alt } : {}),
    estimatedCostPerPersonEur: Math.round(num(raw.estimatedCostPerPersonEur)),
    sustainabilityTips: Array.isArray(raw.sustainabilityTips) ? raw.sustainabilityTips.map(str) : [],
  };
}
