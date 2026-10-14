// Owner: Person C
import { NextResponse } from "next/server";
import { z } from "zod";
import { ProfileSchema, TripRequestSchema } from "@/lib/types";
import { generatePlan } from "@/lib/ai/plan";

// Give the AI call time to finish on Vercel (default timeout is shorter).
export const maxDuration = 60;

const BodySchema = z.object({ profile: ProfileSchema, request: TripRequestSchema });

export async function POST(req: Request) {
  const body = BodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    const plan = await generatePlan(body.data.profile, body.data.request);
    return NextResponse.json(plan);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
