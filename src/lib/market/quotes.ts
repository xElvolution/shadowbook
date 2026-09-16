import type { Quote, RToken } from "../types";
import { UNIVERSE } from "../types";
import { sessionPhase } from "../clock";

/** Lived-in mid anchors for Bitget-style rToken marks (USDT). */
const ANCHORS: Record<RToken, number> = {
  rAAPL: 228.4,
  rNVDA: 142.8,
  rTSLA: 248.6,
  rMSFT: 428.1,
  rAMZN: 198.3,
};

function drift(symbol: RToken, ts: number): number {
  const seed = symbol.charCodeAt(1) * 17 + Math.floor(ts / 60000);
  const wave = Math.sin(seed / 11) * 0.004 + Math.cos(seed / 23) * 0.0025;
  return wave;
}

export function quoteFor(symbol: RToken, ts = Date.now()): Quote {
  const base = ANCHORS[symbol];
  const d = drift(symbol, ts);
  const mid = +(base * (1 + d)).toFixed(2);
  const spread = mid * 0.0006;
  const phase = sessionPhase(ts);
  const session: Quote["session"] =
    phase === "weekend" ? "stale" : phase === "overnight" || phase === "cash_open" ? "live" : "live";
  return {
    symbol,
    mid,
    bid: +(mid - spread / 2).toFixed(2),
    ask: +(mid + spread / 2).toFixed(2),
    changePct: d,
    ts,
    session,
  };
}

export function bookQuotes(ts = Date.now()): Quote[] {
  return UNIVERSE.map((s) => quoteFor(s, ts));
}

export function markPositions(
  positions: { symbol: RToken; qty: number; avgCost: number }[],
  ts = Date.now(),
) {
  return positions.map((p) => {
    const q = quoteFor(p.symbol, ts);
    return { ...p, mark: q.mid };
  });
}
