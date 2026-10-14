// SHARED CONTRACT – all three slices depend on this file.
// Announce changes in the team chat before merging.
import { z } from "zod";

export const ProfileSchema = z.object({
  name: z.string(),
  homeCity: z.string(),
  age: z.number().int().positive().optional(), // used to adapt pace and the UI (larger text for older travellers)
  budgetPerPersonEur: z.number().int().positive(),
  travelStyle: z.enum(["relaxed", "balanced", "adventurous"]),
  interests: z.array(z.string()), // e.g. ["food", "hiking", "museums"]
  needs: z.string().optional(), // dietary, accessibility, kids...
  sustainability: z.enum(["low", "medium", "high"]), // how much to prioritise low-CO₂ options
});
export type Profile = z.infer<typeof ProfileSchema>;

export const TripRequestSchema = z.object({
  startDate: z.string(), // ISO date, e.g. "2026-11-02"
  endDate: z.string(),
  destination: z.string().optional(), // empty = "surprise me"
  travellers: z.number().int().positive(),
});
export type TripRequest = z.infer<typeof TripRequestSchema>;

export const DaySchema = z.object({
  day: z.number().int().positive(),
  title: z.string(),
  activities: z.array(z.string()),
});

export const TransportSchema = z.object({
  mode: z.enum(["train", "bus", "car", "ferry", "flight"]),
  description: z.string(),
  co2Kg: z.number(), // estimate, per person, round trip
});

export const TripPlanSchema = z.object({
  destination: z.string(),
  pitch: z.string(), // 1–2 sentences on why this fits the profile
  days: z.array(DaySchema),
  transport: TransportSchema,
  alternativeTransport: TransportSchema.optional(), // e.g. the flight we avoided
  estimatedCostPerPersonEur: z.number(),
  sustainabilityTips: z.array(z.string()),
});
export type TripPlan = z.infer<typeof TripPlanSchema>;

export type SavedTrip = {
  id: string;
  createdAt: string;
  request: TripRequest;
  plan: TripPlan;
};
