import Link from "next/link";

const LINKS = [
  { href: "/home", label: "Home" },
  { href: "/shadow", label: "Shadow" },
  { href: "/promote", label: "Promote" },
  { href: "/markets", label: "Markets" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export function AppNav({ current }: { current?: string }) {
  return (
    <header className="border-b border-line bg-bge/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/home" className="text-sm font-semibold tracking-wide text-ink">
          SHADOWBOOK
        </Link>
        <nav className="flex flex-wrap gap-1 text-xs">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 ${
                current === l.href
                  ? "bg-promote/20 text-promote"
                  : "text-mute hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
