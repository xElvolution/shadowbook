"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type Leg = {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  fillPrice: number;
  notional: number;
  confidence: number;
  riskScore: number;
  rationale: string;
  status: string;
  receiptHash: string;
};

export default function PromotePage() {
  const [pending, setPending] = useState<Leg[]>([]);
  const [greens, setGreens] = useState<Leg[]>([]);
  const [policyHash, setPolicyHash] = useState("");
  const [dualAckRequired, setDualAckRequired] = useState(true);
  const [secondaryAck, setSecondaryAck] = useState("");
  const [policySeal, setPolicySeal] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState("");
  const [liveCash, setLiveCash] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/promote");
    const data = await res.json();
    if (!data.ok) return;
    setPending(data.pending || []);
    setGreens(data.greenCandidates || []);
    setPolicyHash(data.policyHash || "");
    setDualAckRequired(Boolean(data.policy?.dualAckRequired));
    setLiveCash(data.live?.cashUsdt ?? null);
    const next: Record<string, boolean> = {};
    for (const g of data.greenCandidates || []) next[g.id] = true;
    setSelected(next);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function ids(): string[] {
    return Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }

  async function act(action: "promote" | "reject" | "accept_greens") {
    setBusy(true);
    setMsg("");
    const body: Record<string, unknown> = {
      action,
      legIds: action === "accept_greens" ? undefined : ids(),
      primaryAck: "operator",
      secondaryAck: secondaryAck || undefined,
      policySeal,
    };
    const res = await fetch("/api/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) {
      setMsg(data.error || "Action failed");
      return;
    }
    if (action === "reject") {
      setMsg(`Rejected ${data.rejected?.length ?? 0} leg(s). Live book unchanged.`);
    } else {
      setMsg(`Promoted ${data.promoted?.length ?? 0} leg(s) to live after dual-ack.`);
    }
    setLiveCash(data.live?.cashUsdt ?? liveCash);
    await load();
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Promote</h1>
        <p className="mt-1 text-sm text-mute">
          Accept or reject each shadow leg. Dual-ack seals the live submit.
        </p>
        <p className="mt-2 text-xs text-faint">
          Live cash {liveCash != null ? `$${liveCash.toFixed(0)}` : "..."}
          {policyHash ? ` · policy ${policyHash}` : ""}
        </p>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-mute">
            <input
              type="checkbox"
              checked={policySeal}
              onChange={(e) => setPolicySeal(e.target.checked)}
            />
            Policy seal
          </label>
          {dualAckRequired ? (
            <input
              className="flex-1 rounded-xl border border-line bg-bge px-3 py-2 text-sm"
              placeholder="Second handle (optional if policy seal on)"
              value={secondaryAck}
              onChange={(e) => setSecondaryAck(e.target.value)}
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={() => act("accept_greens")}
              className="rounded-full bg-gain/20 px-3 py-1.5 text-xs text-gain"
            >
              Accept all green
            </button>
            <button
              disabled={busy || ids().length === 0}
              onClick={() => act("promote")}
              className="rounded-full bg-promote px-3 py-1.5 text-xs font-medium text-bg"
            >
              Promote selected
            </button>
            <button
              disabled={busy || ids().length === 0}
              onClick={() => act("reject")}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-loss"
            >
              Reject selected
            </button>
          </div>
        </div>

        {msg ? <p className="mt-3 text-sm text-mute">{msg}</p> : null}

        <div className="mt-6 space-y-3">
          {pending.length === 0 ? (
            <p className="text-sm text-mute">No pending legs. Run a night on the Shadow board.</p>
          ) : (
            pending.map((leg) => {
              const isGreen = greens.some((g) => g.id === leg.id);
              return (
                <label
                  key={leg.id}
                  className={`block cursor-pointer rounded-2xl border p-4 ${
                    isGreen ? "border-gain/40 bg-gain/5" : "border-line bg-surface"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={Boolean(selected[leg.id])}
                      onChange={(e) =>
                        setSelected((s) => ({ ...s, [leg.id]: e.target.checked }))
                      }
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          <span className="uppercase text-mute">{leg.side}</span> {leg.qty}{" "}
                          {leg.symbol} @ {leg.fillPrice.toFixed(2)}
                        </p>
                        {isGreen ? (
                          <span className="text-xs text-gain">green</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-mute">{leg.rationale}</p>
                      <p className="mt-1 font-mono text-xs text-faint">
                        conf {leg.confidence.toFixed(2)} · risk {leg.riskScore.toFixed(2)} ·{" "}
                        ${leg.notional.toFixed(0)} · {leg.receiptHash.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </main>
    </AppShell>
  );
}
