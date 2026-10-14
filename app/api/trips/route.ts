// Owner: Person B
// TODO(B): replace the in-memory store with the Supabase `trips` table (see supabase/schema.sql).
import { NextResponse } from "next/server";
import { z } from "zod";
import { TripPlanSchema, TripRequestSchema, type SavedTrip } from "@/lib/types";

const trips: SavedTrip[] = []; // resets on every server restart – fine for day one

export async function GET() {
  return NextResponse.json(trips);
}

const BodySchema = z.object({ request: TripRequestSchema, plan: TripPlanSchema });

export async function POST(req: Request) {
  const body = BodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid trip" }, { status: 400 });
  const trip: SavedTrip = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...body.data,
  };
  trips.unshift(trip);
  return NextResponse.json(trip, { status: 201 });
}
