// Owner: Person C. Server-only – never import this from a client component.
// Uses Groq's free, OpenAI-compatible API (https://console.groq.com) via plain fetch – no extra package.
import { TripPlanSchema, type Profile, type TripPlan, type TripRequest } from "@/lib/types";
import { mockPlan } from "@/lib/mock";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Any model listed at https://console.groq.com/docs/models works here.
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a sustainable-travel planner for a webapp whose theme is "a better tomorrow".
Plan ONE trip that genuinely fits the traveller's profile and request.

Rules:
- If no destination is given, pick one yourself that fits interests, budget and season.
- Number of days = number of calendar days from startDate to endDate, inclusive. One entry per day.
- Prefer train or bus when the journey is realistic (roughly under 10 hours). Use a flight only if there is no sensible alternative.
- Respect sustainability: "high" = strongly prefer low-CO₂ options and off-season/less crowded places; "low" = comfort first.
- Respect budget per person, travel style, interests, number of travellers and any special needs.
- If age is given, adapt the pace: travellers around 65+ get fewer, calmer activities per day, short walking distances, step-free/accessible options, rest time and comfortable direct connections (fewer changes). Younger travellers can have a busier schedule.
- Consider the season of the dates (weather, opening times).
- Activities are short, concrete phrases (3–5 per day). Include travel on the first and last day.
- co2Kg = estimated kg CO₂ per person for the ROUND trip. Rough factors per passenger-km: train 0.03, bus 0.03, ferry 0.12, car 0.17 divided by travellers (max 4), flight 0.20.
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

  const userPrompt = `Profile: ${JSON.stringify(profile)}\nRequest: ${JSON.stringify(request)}`;
  let lastError = "unknown error";

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      lastError = `Groq API ${res.status}: ${(await res.text()).slice(0, 200)}`;
      if (res.status === 429 || res.status >= 500) continue; // rate limit / hiccup → retry once
      break;
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    try {
      const raw = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      // Models sometimes send null for the optional field – treat it as missing.
      if (raw.alternativeTransport == null) delete raw.alternativeTransport;
      return TripPlanSchema.parse(raw);
    } catch (e) {
      lastError = `Invalid plan from model: ${(e as Error).message.slice(0, 200)}`;
    }
  }

  console.error("[ai] generatePlan failed:", lastError);
  throw new Error("Could not generate a plan right now. Please try again.");
}
