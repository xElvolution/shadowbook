"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { fmtUsd } from "@/lib/format";

type Pos = { symbol: string; qty: number; avgCost: number; mark: number };

export default function HomePage() {
  const [waiting, setWaiting] = useState(0);
  const [shadowPnl, setShadowPnl] = useState(0);
  const [bookCash, setBookCash] = useState<number | null>(null);
  const [shadowCash, setShadowCash] = useState<number | null>(null);
  const [livePos, setLivePos] = useState<Pos[]>([]);
  const [shadowPos, setShadowPos] = useState<Pos[]>([]);
  const [bundleHash, setBundleHash] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/book")
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return;
        setWaiting(d.waitingCount ?? 0);
        setShadowPnl(d.shadowPnl ?? 0);
        setBookCash(d.book?.cashUsdt ?? null);
        setShadowCash(d.shadow?.cashUsdt ?? null);
        setLivePos(d.book?.positions ?? []);
        setShadowPos(d.shadow?.positions ?? []);
        setBundleHash(d.bundle?.bundleHash ?? null);
      });
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">Home</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em]">Overnight board</h1>
            <p className="mt-2 max-w-lg text-[14px] text-mute">
              Live book is read-only until you promote. Shadow twin carries tonight sized fills.
            </p>
          </div>
          <Link href="/promote" className="btn-primary">
            {waiting} leg{waiting === 1 ? "" : "s"} waiting
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <div className="label">Shadow P&amp;L</div>
            <div
              className={`mt-2 text-[28px] font-semibold tabular ${shadowPnl >= 0 ? "text-gain" : "text-loss"}`}
            >
              {fmtUsd(shadowPnl)}
            </div>
            <p className="mt-1 text-[12px] text-faint">Realized on twin only</p>
          </div>
          <div className="card p-5">
            <div className="label">Waiting to promote</div>
            <div className="mt-2 text-[28px] font-semibold tabular text-promote">{waiting}</div>
            <p className="mt-1 text-[12px] text-faint">Line-item accept or discard</p>
          </div>
          <div className="card p-5">
            <div className="label">Night bundle</div>
            <div className="mt-2 truncate text-[15px] font-medium tabular text-accent">
              {bundleHash?.slice(0, 16) ?? "-"}
            </div>
            <p className="mt-1 text-[12px] text-faint">Content-addressed</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Live book</h2>
              <span className="rounded-full bg-surface2 px-2 py-0.5 text-[10px] uppercase tracking-wider text-faint">
                Read-only
              </span>
            </div>
            <ul className="mt-4">
              {livePos.map((p) => (
                <li
                  key={p.symbol}
                  className="flex items-center justify-between border-b border-line py-3 text-[13px]"
                >
                  <div>
                    <div className="font-medium">{p.symbol}</div>
                    <div className="text-[11px] text-faint">
                      {p.qty} @ {fmtUsd(p.avgCost)}
                    </div>
                  </div>
                  <div className="tabular">{fmtUsd(p.mark)}</div>
                </li>
              ))}
              {livePos.length === 0 && (
                <li className="py-6 text-mute">No book yet. Finish onboarding.</li>
              )}
            </ul>
            {bookCash != null && (
              <div className="mt-3 flex justify-between text-[12px] text-mute">
                <span>Cash</span>
                <span className="tabular">{fmtUsd(bookCash)}</span>
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Shadow twin</h2>
              <Link href="/shadow" className="text-[12px] text-accent hover:underline">
                Tonight moves
              </Link>
            </div>
            <ul className="mt-4">
              {shadowPos.map((p) => (
                <li
                  key={p.symbol}
                  className="flex items-center justify-between border-b border-line py-3 text-[13px]"
                >
                  <div>
                    <div className="font-medium">{p.symbol}</div>
                    <div className="text-[11px] text-faint">
                      {p.qty} @ {fmtUsd(p.avgCost)}
                    </div>
                  </div>
                  <div className="tabular">{fmtUsd(p.mark)}</div>
                </li>
              ))}
              {shadowPos.length === 0 && (
                <li className="py-6 text-mute">Twin not spawned.</li>
              )}
            </ul>
            {shadowCash != null && (
              <div className="mt-3 flex justify-between text-[12px] text-mute">
                <span>Twin cash</span>
                <span className="tabular">{fmtUsd(shadowCash)}</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
