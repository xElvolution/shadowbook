import { getBook, getShadow, spawnShadowTwin, seedBitgetBook } from "../book/sync";
import { appendAudit } from "../audit/log";
import {
  applyShadowFill,
  getNightBundle,
  openNightBundle,
  sealBundle,
  saveNightBundle,
  syncShadowFromBook,
} from "./ledger";
import type { NightBundle, RToken, Side } from "../types";

/**
 * Overnight cycle: research → sized shadow intents only.
 * Live Bitget order API is DISABLED for the agent overnight.
 */
const PLAYBOOK: {
  symbol: RToken;
  side: Side;
  qty: number;
  confidence: number;
  rationale: string;
}[] = [
  {
    symbol: "rAAPL",
    side: "buy",
    qty: 6,
    confidence: 0.78,
    rationale: "Post-close bid support. Add size on the shadow twin while cash is closed.",
  },
  {
    symbol: "rNVDA",
    side: "sell",
    qty: 8,
    confidence: 0.74,
    rationale: "Trim heat after run-up. Shadow-only reduce until morning promote.",
  },
  {
    symbol: "rTSLA",
    side: "buy",
    qty: 5,
    confidence: 0.66,
    rationale: "Overnight bounce priced in. Modest shadow add behind the risk gate.",
  },
  {
    symbol: "rMSFT",
    side: "buy",
    qty: 4,
    confidence: 0.84,
    rationale: "Steady megacap flow. High confidence shadow leg.",
  },
  {
    symbol: "rAMZN",
    side: "sell",
    qty: 9,
    confidence: 0.48,
    rationale: "Soft print. Likely blocked on confidence floor or flagged for reject.",
  },
];

export function runNightCycle(operatorId: string, ts = Date.now()): {
  bundle: NightBundle;
  fillCount: number;
  blocked: number;
  liveBookUntouched: true;
  liveOrdersDisabled: true;
} {
  if (!getBook(operatorId)) seedBitgetBook(operatorId, ts);
  // Freeze sync → fresh shadow twin from live book
  syncShadowFromBook(operatorId, ts);
  if (!getShadow(operatorId)) spawnShadowTwin(operatorId, ts);

  // Fresh night bundle (replaces prior open night)
  const bundle = openNightBundle(operatorId, ts);

  let fillCount = 0;
  let blocked = 0;

  for (const play of PLAYBOOK) {
    const leg = applyShadowFill({
      operatorId,
      symbol: play.symbol,
      side: play.side,
      qty: play.qty,
      confidence: play.confidence,
      riskScore: 1 - play.confidence,
      rationale: play.rationale,
      ts,
    });
    if (!leg) {
      blocked += 1;
      continue;
    }
    if (leg.status === "blocked") blocked += 1;
    else fillCount += 1;
  }

  const latest = getNightBundle(operatorId) ?? bundle;
  latest.liveOrdersDisabled = true;
  sealBundle(latest);
  saveNightBundle(operatorId, latest);

  appendAudit({
    operatorId,
    actor: "night_agent",
    action: "night.run",
    detail: `Night ${latest.id}: ${fillCount} shadow fill(s), ${blocked} blocked. Live book untouched.`,
  });

  return {
    bundle: latest,
    fillCount,
    blocked,
    liveBookUntouched: true,
    liveOrdersDisabled: true,
  };
}
