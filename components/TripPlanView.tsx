// Owner: Person A
import type { TripPlan } from "@/lib/types";

export function TripPlanView({ plan }: { plan: TripPlan }) {
  const saved = plan.transport && plan.alternativeTransport ? plan.alternativeTransport.co2Kg - plan.transport.co2Kg : 0;
  return (
    <article className="space-y-5 rounded-3xl border-2 border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <header>
        <h2 className="font-serif text-3xl font-bold text-emerald-950">{plan.destination}</h2>
        <p className="text-lg text-gray-700">{plan.pitch}</p>
      </header>
      {plan.transport ? (
        <div className="rounded-xl bg-emerald-50 p-4">
          <p><strong>Getting there:</strong> {plan.transport.description} · ~{plan.transport.co2Kg} kg CO₂ per person</p>
          {saved > 0 && <p>That saves about {saved} kg CO₂ per person compared with {plan.alternativeTransport!.mode}.</p>}
          <p className="text-gray-600">Estimates only.</p>
        </div>
      ) : (
        <p className="rounded-xl bg-emerald-50 p-4">You&apos;re already here, so no travel is needed – zero travel CO₂.</p>
      )}
      <ol className="space-y-3">
        {plan.days.map((d) => (
          <li key={d.day}>
            <p className="font-semibold">Day {d.day}: {d.title}</p>
            <ul className="list-disc pl-6">{d.activities.map((a) => <li key={a}>{a}</li>)}</ul>
          </li>
        ))}
      </ol>
      {plan.sustainabilityTips.length > 0 && (
        <div>
          <p className="font-semibold">Greener travel tips</p>
          <ul className="list-disc pl-6">{plan.sustainabilityTips.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      )}
      <p className="text-lg font-semibold">Estimated cost: ~€{plan.estimatedCostPerPersonEur} (estimate)</p>
    </article>
  );
}
