// Owner: Person A
import type { Metadata } from "next";
import Link from "next/link";
import { TextSizeToggle } from "@/components/TextSize";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vacation Planner",
  description: "Greener trips planned from your travel profile",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-gray-900 antialiased">
        <header className="border-b-4 border-amber-400 bg-emerald-800 text-white">
          <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
            <Link href="/" className="mr-auto text-xl font-bold">
              🌿 Vacation Planner
            </Link>
            <Link href="/onboarding" className="font-medium hover:underline">Profile</Link>
            <Link href="/plan" className="font-medium hover:underline">Plan a trip</Link>
            <Link href="/trips" className="font-medium hover:underline">My trips</Link>
            <div className="rounded-full bg-white">
              <TextSizeToggle />
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
