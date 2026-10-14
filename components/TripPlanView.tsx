// Owner: Person A
import type { TripPlan } from "@/lib/types";

export function TripPlanView({ plan }: { plan: TripPlan }) {
  const saved = plan.alternativeTransport ? plan.alternativeTransport.co2Kg - plan.transport.co2Kg : 0;
  return (
    <article className="space-y-5 rounded-xl border p-6">
      <header>
        <h2 className="text-xl font-bold">{plan.destination}</h2>
        <p className="text-gray-600">{plan.pitch}</p>
      </header>
      <div className="rounded-lg bg-emerald-50 p-4 text-sm">
        <p><strong>Getting there:</strong> {plan.transport.description} · ~{plan.transport.co2Kg} kg CO₂ per person</p>
        {saved > 0 && <p>That saves about {saved} kg CO₂ per person compared with {plan.alternativeTransport!.mode}.</p>}
        <p className="text-gray-500">Estimates only.</p>
      </div>
      <ol className="space-y-3">
        {plan.days.map((d) => (
          <li key={d.day}>
            <p className="font-semibold">Day {d.day}: {d.title}</p>
            <ul className="list-disc pl-5 text-sm">{d.activities.map((a) => <li key={a}>{a}</li>)}</ul>
          </li>
        ))}
      </ol>
      <p className="text-sm">Estimated cost: ~€{plan.estimatedCostPerPersonEur} per person</p>
    </article>
  );
}
