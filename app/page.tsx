// Owner: Person A
import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold">Your next trip, planned for you and the planet</h1>
      <p className="text-lg text-gray-600">
        Tell us how you like to travel once. We plan the whole trip, and show you the greener way to get there.
      </p>
      <Link href="/onboarding" className="inline-block rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white">
        Get started
      </Link>
    </section>
  );
}
