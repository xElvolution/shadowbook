"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { useOperator } from "@/components/operator-context";
import { fmtUsd, fmtQty } from "@/lib/format";

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
  const { operator } = useOperator();
  const [pending, setPending] = useState<Leg[]>([]);
  const [greens, setGreens] = useState<Leg[]>([]);
  const [policyHash, setPolicyHash] = useState("");
  const [dualAckRequired, setDualAckRequired] = useState(true);
  const [secondaryAck, setSecondaryAck] = useState("");
  const [policySeal, setPolicySeal] = useState(true);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
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
    for (const leg of data.pending || []) {
      if (leg.status === "accepted") next[leg.id] = true;
    }
    setAccepted(next);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const acceptedIds = useMemo(
    () => Object.entries(accepted).filter(([, v]) => v).map(([k]) => k),
    [accepted],
  );

  const greenIds = useMemo(() => new Set(greens.map((g) => g.id)), [greens]);

  const dualReady = useMemo(() => {
    if (!dualAckRequired) return true;
    if (policySeal) return true;
    const secondary = secondaryAck.trim();
    if (!secondary) return false;
    const primary = (operator?.handle || "").trim().toLowerCase();
    return secondary.toLowerCase() !== primary;
  }, [dualAckRequired, policySeal, secondaryAck, operator?.handle]);

  async function post(
    action: "promote" | "reject" | "accept" | "accept_greens",
    legIds?: string[],
  ) {
    setBusy(true);
    setMsg("");
    const body: Record<string, unknown> = {
      action,
      legIds,
      primaryAck: operator?.handle || "operator",
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
      setMsg(`Discarded ${data.rejected?.length ?? 0} leg(s). Live book unchanged.`);
    } else if (action === "accept") {
      setMsg(`Marked ${data.accepted?.length ?? 0} leg(s) ready. Promote when sealed.`);
    } else {
      setMsg(`Promoted ${data.promoted?.length ?? 0} leg(s) to live. Shadow night is now real.`);
    }
    setLiveCash(data.live?.cashUsdt ?? liveCash);
    await load();
  }

  function acceptLeg(id: string) {
    setAccepted((s) => ({ ...s, [id]: true }));
    void post("accept", [id]);
  }

  function rejectLeg(id: string) {
    setAccepted((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
    void post("reject", [id]);
  }

  function acceptAllGreen() {
    const ids = greens.map((g) => g.id);
    setAccepted((s) => {
      const next = { ...s };
      for (const id of ids) next[id] = true;
      return next;
    });
    void post("accept", ids);
  }

  function promoteAccepted() {
    if (!dualReady) {
      setMsg("Seal the policy (or add a second handle) before live submit.");
      return;
    }
    void post("promote", acceptedIds);
  }

  const count = pending.length;
  const readyCount = acceptedIds.filter((id) => pending.some((p) => p.id === id)).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <p className="label text-promote">Bitget morning board</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em]">Promote</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-6 text-mute">
          Promote shadow rToken fills into your live Bitget book, or discard them. Live holdings
          only move when you promote.
        </p>
        <p className="mt-2 text-[13px] text-faint">
          Live cash {liveCash != null ? fmtUsd(liveCash, 0) : "..."}
          {count > 0 ? ` · ${count} leg${count === 1 ? "" : "s"} waiting` : ""}
        </p>

        {count === 0 ? (
          <div className="card mt-8 p-6">
            <p className="text-[15px] font-medium">No legs waiting to promote</p>
            <p className="mt-2 text-[14px] text-mute">
              Run a night on the Shadow board. Sized fills land here for line-item accept or
              discard.
            </p>
            <Link href="/shadow" className="btn-primary mt-5 inline-flex">
              Open Shadow
            </Link>
          </div>
        ) : (
          <>
            <section className="card mt-6 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="label">Dual-ack before live</p>
                  <p className="mt-1 text-[13px] text-mute">
                    Operator @{operator?.handle ?? "you"} plus policy seal (or a second handle).
                  </p>
                </div>
                {policyHash ? (
                  <span className="rounded-full bg-surface2 px-2.5 py-1 font-mono text-[11px] text-faint">
                    policy {policyHash.slice(0, 8)}
                  </span>
                ) : null}
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-bge px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--promote)]"
                  checked={policySeal}
                  onChange={(e) => setPolicySeal(e.target.checked)}
                />
                <span className="text-[14px]">
                  <span className="font-medium text-ink">Policy seal</span>
                  <span className="mt-0.5 block text-[12px] text-mute">
                    I confirm promote rails for this live submit.
                  </span>
                </span>
              </label>

              {dualAckRequired ? (
                <input
                  className="mt-3 w-full rounded-xl border border-line bg-bge px-3 py-2.5 text-[14px] text-ink placeholder:text-faint"
                  placeholder="Second handle (optional when policy seal is on)"
                  value={secondaryAck}
                  onChange={(e) => setSecondaryAck(e.target.value)}
                  autoComplete="off"
                />
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={busy || readyCount === 0 || !dualReady}
                  onClick={promoteAccepted}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy
                    ? "Working..."
                    : readyCount === 1
                      ? "Promote 1 to live"
                      : `Promote ${readyCount} to live`}
                </button>
                <button
                  type="button"
                  disabled={busy || greens.length === 0}
                  onClick={acceptAllGreen}
                  className="btn-ghost disabled:opacity-40"
                >
                  Accept all green ({greens.length})
                </button>
              </div>
              {!dualReady ? (
                <p className="mt-3 text-[12px] text-warn">
                  Seal the policy or add a second distinct handle to unlock live submit.
                </p>
              ) : (
                <p className="mt-3 text-[12px] text-faint">
                  One primary action. Rejected legs never touch live.
                </p>
              )}
            </section>

            {msg ? (
              <p className="mt-4 text-[14px] text-mute" role="status">
                {msg}
              </p>
            ) : null}

            <div className="mt-6 space-y-3">
              {pending.map((leg) => {
                const isGreen = greenIds.has(leg.id);
                const isReady = Boolean(accepted[leg.id]);
                return (
                  <article
                    key={leg.id}
                    className={`card p-5 ${isGreen ? "shadow-[inset_0_0_0_1px_rgba(61,214,140,0.28)]" : ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold">
                          <span className="uppercase text-mute">{leg.side}</span>{" "}
                          {fmtQty(leg.qty)} {leg.symbol}{" "}
                          <span className="text-mute">@ {leg.fillPrice.toFixed(2)}</span>
                        </p>
                        <p className="mt-1 text-[13px] leading-5 text-mute">{leg.rationale}</p>
                        <p className="mt-2 text-[12px] text-faint">
                          {fmtUsd(leg.notional, 0)} notional
                          {isGreen ? " · green candidate" : ""}
                          {isReady ? " · ready" : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={busy || isReady}
                          onClick={() => acceptLeg(leg.id)}
                          className="rounded-full bg-gain/15 px-3.5 py-1.5 text-[13px] font-semibold text-gain disabled:opacity-40"
                        >
                          {isReady ? "Accepted" : "Accept"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => rejectLeg(leg.id)}
                          className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-loss disabled:opacity-40"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
