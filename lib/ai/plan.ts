// Owner: Person C. Server-only – never import this from a client component.
import Anthropic from "@anthropic-ai/sdk";
import { TripPlanSchema, type Profile, type TripPlan, type TripRequest } from "@/lib/types";
import { mockPlan } from "@/lib/mock";

// Check https://docs.claude.com/en/docs/about-claude/models for current model names.
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

export async function generatePlan(profile: Profile, request: TripRequest): Promise<TripPlan> {
  // No key yet? Return the mock so the rest of the team is never blocked.
  if (!process.env.ANTHROPIC_API_KEY) return mockPlan;

  const client = new Anthropic();
  const prompt = `You are a sustainable-travel planner. Plan a trip for this traveller.

Profile: ${JSON.stringify(profile)}
Request: ${JSON.stringify(request)}

Prefer train/bus over flights when the journey is under ~10 hours, and off-season or less crowded places.
Reply with ONLY a JSON object with these keys:
destination, pitch, days[{day,title,activities[]}], transport{mode,description,co2Kg},
alternativeTransport{mode,description,co2Kg}, estimatedCostPerPersonEur, sustainabilityTips[].
mode is one of: train, bus, car, ferry, flight. co2Kg is a per-person round-trip estimate.`;

  for (let attempt = 0; attempt < 2; attempt++) {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    try {
      return TripPlanSchema.parse(JSON.parse(json));
    } catch {
      // retry once on malformed output
    }
  }
  throw new Error("Could not generate a valid plan");
}
