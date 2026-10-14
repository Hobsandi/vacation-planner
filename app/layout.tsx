// Owner: Person A
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vacation Planner",
  description: "Greener trips planned from your travel profile",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <nav className="flex gap-6 border-b px-6 py-4 text-sm">
          <Link href="/" className="font-semibold">Vacation Planner</Link>
          <Link href="/onboarding">Profile</Link>
          <Link href="/plan">Plan a trip</Link>
          <Link href="/trips">My trips</Link>
        </nav>
        <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
