// Owner: Person B
// DEPRECATED for the MVP: trips are stored in the browser via lib/db/storage.ts.
// This in-memory route does not persist on Vercel (each request can hit a fresh server),
// so the frontend should NOT call it. Kept only so old code doesn't break.
import { NextResponse } from "next/server";
import { z } from "zod";
import { TripPlanSchema, TripRequestSchema, type SavedTrip } from "@/lib/types";

const trips: SavedTrip[] = [];

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
