"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cls } from "@/lib/format";
import { LogoMark } from "./logo";
import { useOperator } from "./operator-context";

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/shadow", label: "Shadow" },
  { href: "/promote", label: "Promote" },
  { href: "/markets", label: "Markets" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { operator, signOut } = useOperator();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      menuBtnRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-[64px] shrink-0 flex-col border-r border-line bg-surface lg:flex xl:w-[200px]">
        <Link href="/home" className="flex h-12 items-center gap-2.5 border-b border-line px-3 xl:px-4">
          <LogoMark size={24} />
          <span className="hidden text-[11px] font-semibold tracking-[0.16em] text-ink xl:inline">
            SHADOWBOOK
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5 p-1.5">
          {NAV.map((l) => {
            const on = path === l.href || path.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cls(
                  "rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-colors xl:px-3",
                  on
                    ? "bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(197,180,255,0.18)]"
                    : "text-mute hover:bg-surface2 hover:text-ink",
                )}
              >
                <span className="xl:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-line p-3 xl:block">
          <div className="text-[11px] text-faint">@{operator?.handle ?? "-"}</div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-2 text-[12px] text-mute hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-xl">
          <div className="flex h-12 items-center gap-3 px-3 lg:px-5">
            <button
              ref={menuBtnRef}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink lg:hidden"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
            >
              <Hamburger open={open} />
            </button>
            <Link href="/home" className="flex items-center gap-2 lg:hidden">
              <LogoMark size={22} />
              <span className="text-[11px] font-semibold tracking-[0.14em]">SHADOWBOOK</span>
            </Link>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-[12px] text-mute sm:inline">
                {operator?.displayName ?? "Operator"}
              </span>
              <Link
                href="/promote"
                className="rounded-full bg-promote/15 px-3 py-1.5 text-[12px] font-semibold text-promote"
              >
                Promote
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Dismiss menu"
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id={panelId}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-line bg-surface lg:hidden"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            >
              <div className="flex h-12 items-center justify-between border-b border-line px-4">
                <WordRow />
                <button
                  ref={closeRef}
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-3">
                {NAV.map((l) => {
                  const on = path === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cls(
                        "rounded-xl px-3 py-3 text-[15px] font-medium",
                        on ? "bg-accent/10 text-accent" : "text-ink hover:bg-surface2",
                      )}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-line p-4">
                <div className="text-[12px] text-mute">@{operator?.handle}</div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="mt-2 text-[13px] text-faint hover:text-ink"
                >
                  Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function WordRow() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={22} />
      <span className="text-[11px] font-semibold tracking-[0.16em]">SHADOWBOOK</span>
    </span>
  );
}

function Hamburger({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d={open ? "M4 4l10 10M14 4L4 14" : "M3 5h12M3 9h12M3 13h12"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
