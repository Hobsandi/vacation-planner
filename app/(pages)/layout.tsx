// Owner: Person A
// Keeps the form pages at a comfortable reading width; the home page uses the full width.
export default function PagesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="mx-auto max-w-3xl">{children}</div>;
}
