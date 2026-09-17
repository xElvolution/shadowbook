"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function MarketsPage() {
  const [data, setData] = useState<{
    label?: string;
    quotes?: { symbol: string; mid: number; bid: number; ask: number; changePct: number }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/markets")
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Bitget Markets</h1>
        <p className="mt-1 text-sm text-mute">
          {data?.label || "Bitget AI S2 · session-aware rToken quotes (rAAPL rNVDA rTSLA rMSFT rAMZN)"}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.quotes || []).map((q) => (
            <div key={q.symbol} className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-sm font-medium">{q.symbol}</p>
              <p className="mt-1 text-xl tabular">{q.mid.toFixed(2)}</p>
              <p className="mt-1 text-xs text-mute">
                {q.bid.toFixed(2)} / {q.ask.toFixed(2)} · {(q.changePct * 100).toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
