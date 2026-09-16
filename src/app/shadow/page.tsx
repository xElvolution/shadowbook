"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type Leg = {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  fillPrice: number;
  confidence: number;
  riskScore: number;
  rationale: string;
  status: string;
  receiptHash: string;
};

export default function ShadowPage() {
  const [legs, setLegs] = useState<Leg[]>([]);
  const [bundleHash, setBundleHash] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/shadow");
    const data = await res.json();
    if (data.ok) {
      setLegs(data.legs || []);
      setBundleHash(data.bundle?.bundleHash ?? null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runNight() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/night/run", { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) {
      setMsg(data.error || "Night run failed");
      return;
    }
    setMsg(
      `Night sealed. ${data.fillCount} shadow fill(s), ${data.blocked} blocked. Live book untouched.`,
    );
    await load();
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Shadow</h1>
            <p className="mt-1 text-sm text-mute">
              Tonight sized rToken moves on the twin. Live orders stay off.
            </p>
          </div>
          <button
            onClick={runNight}
            disabled={busy}
            className="rounded-full bg-accent/20 px-4 py-2 text-sm text-accent disabled:opacity-50"
          >
            {busy ? "Running night..." : "Run night cycle"}
          </button>
        </div>
        {msg ? <p className="mt-3 text-sm text-gain">{msg}</p> : null}
        {bundleHash ? (
          <p className="mt-2 font-mono text-xs text-faint">Bundle {bundleHash}</p>
        ) : null}
        <div className="mt-6 space-y-3">
          {legs.length === 0 ? (
            <p className="text-sm text-mute">No shadow legs yet. Run the night cycle.</p>
          ) : (
            legs.map((leg) => (
              <article
                key={leg.id}
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    <span className="uppercase text-mute">{leg.side}</span>{" "}
                    {leg.qty} {leg.symbol} @ {leg.fillPrice.toFixed(2)}
                  </p>
                  <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs text-mute">
                    {leg.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-mute">{leg.rationale}</p>
                <p className="mt-2 font-mono text-xs text-faint">
                  conf {leg.confidence.toFixed(2)} · risk {leg.riskScore.toFixed(2)} · receipt{" "}
                  {leg.receiptHash.slice(0, 8)}
                </p>
              </article>
            ))
          )}
        </div>
      </main>
    </AppShell>
  );
}
