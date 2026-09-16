"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function HistoryPage() {
  const [receipts, setReceipts] = useState<
    { id: string; kind: string; summary: string; hash: string; ts: number }[]
  >([]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setReceipts(d.receipts || []))
      .catch(() => null);
  }, []);

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="mt-1 text-sm text-mute">Sealed receipts. No receipt means it never happened.</p>
        <div className="mt-6 space-y-2">
          {receipts.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-surface px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-promote">{r.kind}</span>
                <span className="font-mono text-xs text-faint">{r.hash.slice(0, 10)}</span>
              </div>
              <p className="mt-1 text-sm text-mute">{r.summary}</p>
            </div>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
