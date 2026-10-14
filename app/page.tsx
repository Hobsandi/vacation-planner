// Owner: Person A
import Link from "next/link";
import {
  AccessibilityIcon,
  ArrowRightIcon,
  CheckIcon,
  CompassIcon,
  LeafIcon,
  PlaneIcon,
  SunIcon,
  TextSizeIcon,
  TrainIcon,
  UserIcon,
} from "@/components/icons";

const FEATURES = [
  {
    Icon: TrainIcon,
    title: "Train before plane",
    text: "We look for train and bus routes first, and show how much CO₂ you save compared with flying.",
  },
  {
    Icon: CompassIcon,
    title: "Made around you",
    text: "Your age, budget, interests and needs shape every day, from the pace to the places you visit.",
  },
  {
    Icon: SunIcon,
    title: "Calmer places",
    text: "Off-season dates and less crowded spots, so the trip feels relaxed instead of rushed.",
  },
];

const STEPS = [
  { title: "Tell us about yourself", text: "Age, home city, budget and what you enjoy. It takes about two minutes." },
  { title: "Pick your dates", text: "Choose where you want to go, or leave it open and let us surprise you." },
  { title: "Get your trip", text: "A day-by-day plan with the greenest way there and an estimated cost." },
];

const ACCESSIBILITY = [
  "Large, clear text, with an even larger setting",
  "A calmer pace for older travellers",
  "Room for walking aids, step-free access and diets",
];

// Example figures from the demo trip (Stockholm to Copenhagen), shown on the preview card.
const EXAMPLE = { train: 6, flight: 130 };

function HeroPreview() {
  const saved = EXAMPLE.flight - EXAMPLE.train;
  return (
    <div className="relative">
      <div className="absolute -right-4 -top-4 h-full w-full rounded-3xl bg-amber-300" aria-hidden="true" />
      <div className="relative space-y-5 rounded-3xl bg-white p-6 text-gray-900 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Example trip</p>
            <p className="font-serif text-2xl font-bold">Copenhagen, 4 days</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">By train</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium"><TrainIcon className="h-5 w-5 text-emerald-700" /> Train</span>
              <span>~{EXAMPLE.train} kg CO₂</span>
            </div>
            <div className="h-3 rounded-full bg-stone-100">
              <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${Math.max(4, (EXAMPLE.train / EXAMPLE.flight) * 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium"><PlaneIcon className="h-5 w-5 text-stone-500" /> Flight</span>
              <span>~{EXAMPLE.flight} kg CO₂</span>
            </div>
            <div className="h-3 rounded-full bg-stone-100">
              <div className="h-3 w-full rounded-full bg-stone-400" />
            </div>
          </div>
          <p className="rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-900">
            You save about {saved} kg CO₂ per person
          </p>
        </div>

        <ol className="space-y-2 border-t border-stone-100 pt-4 text-gray-700">
          {["Arrive and walk the harbour", "Old town and food market", "Forest day trip and picnic"].map((d, i) => (
            <li key={d} className="flex gap-3">
              <span className="shrink-0 font-semibold text-emerald-700">Day {i + 1}</span> {d}
            </li>
          ))}
        </ol>
        <p className="text-xs text-gray-500">Estimates only.</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-20 pb-6">
      {/* Hero */}
      <section className="relative -mx-6 -mt-10 overflow-hidden bg-emerald-900 px-6 py-16 text-white sm:rounded-b-[3rem] sm:py-20">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-700/50 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-teal-500/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/60 bg-emerald-800/60 px-4 py-1.5 font-medium text-emerald-100">
              <LeafIcon className="h-5 w-5 text-amber-300" /> Greener holidays, planned around you
            </p>
            <h1 className="font-serif text-5xl font-bold leading-[1.1] sm:text-6xl">
              Your next trip, planned for you <span className="text-amber-300">and the planet.</span>
            </h1>
            <p className="max-w-xl text-xl text-emerald-100">
              Tell us how you like to travel once. We plan the whole trip, and show you the greener way to get there.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-3 rounded-full bg-amber-300 px-8 py-4 text-xl font-bold text-emerald-950 shadow-lg hover:bg-amber-200"
              >
                Get started <ArrowRightIcon className="h-6 w-6" />
              </Link>
              <a href="#how" className="rounded-full px-5 py-4 text-lg font-semibold text-white underline-offset-4 hover:underline">
                How it works
              </a>
            </div>
            <p className="flex flex-wrap gap-x-6 gap-y-2 text-emerald-200">
              <span className="flex items-center gap-2"><CheckIcon className="h-5 w-5 text-amber-300" /> Free to use</span>
              <span className="flex items-center gap-2"><CheckIcon className="h-5 w-5 text-amber-300" /> No account needed</span>
            </p>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl space-y-10">
        <div className="max-w-2xl space-y-3">
          <p className="font-semibold uppercase tracking-wider text-emerald-700">Why travel with us</p>
          <h2 className="font-serif text-4xl font-bold text-emerald-950">Good for you, lighter on the planet</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="space-y-4 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="font-serif text-2xl font-bold text-emerald-950">{title}</h3>
              <p className="text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-5xl scroll-mt-24 space-y-10">
        <div className="max-w-2xl space-y-3">
          <p className="font-semibold uppercase tracking-wider text-emerald-700">How it works</p>
          <h2 className="font-serif text-4xl font-bold text-emerald-950">Three steps to your trip</h2>
        </div>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative space-y-3 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-stone-200">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900 font-serif text-2xl font-bold text-amber-300">
                {i + 1}
              </span>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-gray-700">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Accessibility */}
      <section className="mx-auto grid max-w-5xl items-center gap-10 rounded-[2rem] bg-amber-100 p-8 sm:p-12 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-800">
            <AccessibilityIcon className="h-7 w-7" />
          </span>
          <h2 className="font-serif text-4xl font-bold text-emerald-950">Made for travellers of every age</h2>
          <p className="text-lg text-gray-800">
            Tell us your age and needs, and we adjust both the trip and the app itself.
          </p>
        </div>
        <ul className="space-y-4">
          {ACCESSIBILITY.map((a, i) => {
            const Icon = [TextSizeIcon, SunIcon, UserIcon][i];
            return (
              <li key={a} className="flex items-center gap-4 rounded-2xl bg-white p-5 text-lg font-medium shadow-sm">
                <Icon className="h-7 w-7 shrink-0 text-emerald-700" />
                {a}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Final call to action */}
      <section className="mx-auto max-w-5xl rounded-[2rem] bg-emerald-900 px-8 py-14 text-center text-white">
        <h2 className="font-serif text-4xl font-bold">Ready for a calmer, greener trip?</h2>
        <p className="mx-auto mt-4 max-w-xl text-xl text-emerald-100">Fill in your profile once, then plan as many trips as you like.</p>
        <Link
          href="/onboarding"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-300 px-8 py-4 text-xl font-bold text-emerald-950 hover:bg-amber-200"
        >
          Create my profile <ArrowRightIcon className="h-6 w-6" />
        </Link>
      </section>
    </div>
  );
}
