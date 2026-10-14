// Owner: Person A
import type { Metadata } from "next";
import Link from "next/link";
import { ProfileMenu } from "@/components/ProfileMenu";
import { LeafIcon } from "@/components/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vacation Planner",
  description: "Greener trips planned from your travel profile",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#faf7f2] text-gray-900 antialiased">
        <header className="sticky top-0 z-10 bg-emerald-950 text-white shadow-md">
          <nav className="mx-auto flex max-w-6xl items-center gap-x-8 px-6 py-3">
            <Link href="/" className="mr-auto flex items-center gap-2.5 font-serif text-2xl font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700">
                <LeafIcon className="h-6 w-6 text-amber-300" />
              </span>
              <span className="hidden sm:inline">Vacation Planner</span>
            </Link>
            <Link href="/plan" className="font-medium text-emerald-50 hover:text-amber-300">Plan a trip</Link>
            <Link href="/trips" className="hidden font-medium text-emerald-50 hover:text-amber-300 sm:inline">My trips</Link>
            <ProfileMenu />
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
        <footer className="border-t border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-gray-600">
            <p className="flex items-center gap-2 font-serif text-lg font-bold text-emerald-900">
              <LeafIcon className="h-5 w-5 text-emerald-700" /> Vacation Planner
            </p>
            <p>Greener holidays, planned around you. Prices and CO₂ figures are estimates.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
