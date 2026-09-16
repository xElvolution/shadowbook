"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/app-shell";
import { fmtUsd } from "@/lib/format";
import type { BookSnapshot, ShadowAccount } from "@/lib/types";

const STEPS = [
  { id: "welcome", title: "Your live book stays clean overnight" },
  { id: "import", title: "Import Bitget book" },
  { id: "spawn", title: "Spawn shadow twin" },
  { id: "ready", title: "Morning promote is the only live path" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [book, setBook] = useState<BookSnapshot | null>(null);
  const [shadow, setShadow] = useState<ShadowAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: string, advance = true) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Step failed.");
        setBusy(false);
        return;
      }
      if (data.book) setBook(data.book);
      if (data.shadow) setShadow(data.shadow);
      if (action === "finish") {
        router.replace("/home");
        return;
      }
      if (advance) setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch {
      setError("Network error.");
    }
    setBusy(false);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <p className="label text-accent">Onboarding</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">
          {STEPS[step].title}
        </h1>
        <div className="mt-4 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-8"
          >
            {step === 0 && (
              <div className="card p-6">
                <p className="text-[15px] leading-7 text-mute">
                  Agents never touch live Bitget orders overnight. They size moves on a twin ledger
                  priced from live rToken mids. At cash open you promote or discard each leg.
                </p>
                <button type="button" className="btn-primary mt-6" onClick={() => setStep(1)}>
                  Continue
                </button>
              </div>
            )}
            {step === 1 && (
              <div className="card p-6">
                <p className="text-[15px] leading-7 text-mute">
                  Pull your rAAPL / rNVDA / rTSLA / rMSFT / rAMZN lots and cash into a read-only
                  snapshot. This is the live book agents cannot write.
                </p>
                {book && (
                  <ul className="mt-4 space-y-2 text-[13px] tabular text-ink">
                    {book.positions.map((p) => (
                      <li key={p.symbol} className="flex justify-between border-b border-line py-2">
                        <span>{p.symbol}</span>
                        <span>
                          {p.qty} @ {fmtUsd(p.avgCost)}
                        </span>
                      </li>
                    ))}
                    <li className="flex justify-between pt-2 text-mute">
                      <span>Cash</span>
                      <span>{fmtUsd(book.cashUsdt)}</span>
                    </li>
                  </ul>
                )}
                <button
                  type="button"
                  disabled={busy}
                  className="btn-primary mt-6"
                  onClick={() => void (book ? setStep(2) : run("import"))}
                >
                  {book ? "Next" : busy ? "Importing…" : "Import Bitget book"}
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="card p-6">
                <p className="text-[15px] leading-7 text-mute">
                  Clone the same lots into the shadow twin. Overnight fills land here only, with a
                  sealed receipt on every sized action.
                </p>
                {shadow && (
                  <p className="mt-4 text-[13px] text-accent">
                    Twin {shadow.id.slice(0, 14)}… open. Realized P&amp;L starts at zero.
                  </p>
                )}
                <button
                  type="button"
                  disabled={busy}
                  className="btn-primary mt-6"
                  onClick={() => void (shadow ? setStep(3) : run("spawn"))}
                >
                  {shadow ? "Next" : busy ? "Spawning…" : "Spawn shadow twin"}
                </button>
              </div>
            )}
            {step === 3 && (
              <div className="card p-6">
                <p className="text-[15px] leading-7 text-mute">
                  Home shows live read-only + shadow P&amp;L + legs waiting. Promote is line-item
                  with dual-ack before anything hits live.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  className="btn-primary mt-6"
                  onClick={() => void run("finish", false)}
                >
                  {busy ? "Opening…" : "Go to Home"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {error && <p className="mt-4 text-[13px] text-loss">{error}</p>}
      </div>
    </AppShell>
  );
}
