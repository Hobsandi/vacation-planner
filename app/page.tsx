// Owner: Person A
import Link from "next/link";

const FEATURES = [
  { icon: "🚆", title: "Train before plane", text: "We look for train and bus routes first and show how much CO₂ you save." },
  { icon: "🧭", title: "Made for you", text: "Your age, budget, interests and pace shape every day of the trip." },
  { icon: "🌤️", title: "Calmer places", text: "Off-season dates and less crowded spots, so the trip feels relaxed." },
];

const STEPS = ["Tell us about yourself", "Pick your dates", "Get a full day-by-day plan"];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="space-y-6 rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-600 to-sky-600 p-8 text-white shadow-lg sm:p-12">
        <p className="inline-block rounded-full bg-white/20 px-4 py-1 font-medium">Greener holidays, planned for you</p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Your next trip, planned for you and the planet</h1>
        <p className="max-w-2xl text-xl text-emerald-50">
          Tell us how you like to travel once. We plan the whole trip, and show you the greener way to get there.
        </p>
        <Link
          href="/onboarding"
          className="inline-block rounded-xl bg-amber-400 px-8 py-4 text-xl font-bold text-gray-900 shadow hover:bg-amber-300"
        >
          Get started →
        </Link>
      </section>

      <section className="grid gap-5 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="space-y-2 rounded-2xl border-2 border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-4xl" aria-hidden>{f.icon}</p>
            <h2 className="text-xl font-bold text-emerald-900">{f.title}</h2>
            <p className="text-gray-700">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl bg-amber-50 p-8">
        <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                {i + 1}
              </span>
              <span className="text-lg font-medium">{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
