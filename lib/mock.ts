// Mock data so every slice can be built before the others are ready.
import type { Profile, TripPlan, TripRequest } from "./types";

export const mockProfile: Profile = {
  name: "Alex",
  homeCity: "Stockholm",
  budgetPerPersonEur: 900,
  travelStyle: "balanced",
  interests: ["food", "hiking", "old towns"],
  sustainability: "high",
};

export const mockRequest: TripRequest = {
  startDate: "2026-11-06",
  endDate: "2026-11-09",
  travellers: 2,
};

export const mockPlan: TripPlan = {
  destination: "Copenhagen, Denmark",
  pitch:
    "A food-focused long weekend reachable by train in about 5 hours, with harbour walks and a day hike north of the city.",
  days: [
    { day: 1, title: "Arrive and explore", activities: ["Train from Stockholm", "Walk Nyhavn", "Dinner at a street-food market"] },
    { day: 2, title: "Old town and food", activities: ["Bike tour of the old town", "Lunch at Torvehallerne", "Evening in Vesterbro"] },
    { day: 3, title: "Nature day", activities: ["Day trip to Dyrehavsbakken forest", "Picnic", "Sauna by the harbour"] },
    { day: 4, title: "Head home", activities: ["Morning coffee in Nørrebro", "Train back to Stockholm"] },
  ],
  transport: { mode: "train", description: "Direct train Stockholm → Copenhagen, ~5 h", co2Kg: 6 },
  alternativeTransport: { mode: "flight", description: "Return flight ARN → CPH", co2Kg: 130 },
  estimatedCostPerPersonEur: 780,
  sustainabilityTips: ["Rent city bikes instead of taxis", "Pick a hotel with an eco-label"],
};
