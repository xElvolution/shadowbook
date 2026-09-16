import { applyShadowFill, getNightBundle } from "./ledger";
import { spawnShadowTwin, getShadow, getBook, seedBitgetBook } from "../book/sync";

/** Lived-in overnight activity for a signed-in operator. Idempotent per night bundle. */
export function ensureLivedInNight(operatorId: string, ts = Date.now()) {
  if (!getBook(operatorId)) seedBitgetBook(operatorId, ts - 8 * 3600_000);
  if (!getShadow(operatorId)) spawnShadowTwin(operatorId, ts - 7 * 3600_000);

  const existing = getNightBundle(operatorId);
  if (existing && existing.legs.length >= 5) return existing;

  const base = ts - 5 * 3600_000;
  const script: Array<{
    symbol: "rAAPL" | "rNVDA" | "rTSLA" | "rMSFT" | "rAMZN";
    side: "buy" | "sell";
    qty: number;
    confidence: number;
    riskScore: number;
    rationale: string;
    offsetMin: number;
  }> = [
    {
      symbol: "rNVDA",
      side: "buy",
      qty: 12,
      confidence: 0.91,
      riskScore: 0.18,
      rationale: "Asia bid stack lifted rNVDA 0.7% off cash close. Size into strength within twin cash.",
      offsetMin: 35,
    },
    {
      symbol: "rAAPL",
      side: "sell",
      qty: 8,
      confidence: 0.74,
      riskScore: 0.22,
      rationale: "Trim into quiet tape. Free twin cash for NVDA add. Live book untouched.",
      offsetMin: 78,
    },
    {
      symbol: "rTSLA",
      side: "buy",
      qty: 6,
      confidence: 0.68,
      riskScore: 0.41,
      rationale: "Headline bounce on delivery chatter. Confidence mid; flag for human morning eye.",
      offsetMin: 140,
    },
    {
      symbol: "rMSFT",
      side: "buy",
      qty: 4,
      confidence: 0.86,
      riskScore: 0.15,
      rationale: "Stable overnight bid. Add small lot to twin; risk gate clear.",
      offsetMin: 195,
    },
    {
      symbol: "rAMZN",
      side: "sell",
      qty: 10,
      confidence: 0.79,
      riskScore: 0.27,
      rationale: "Fade early strength vs peers. Rebalance twin weight without touching live holdings.",
      offsetMin: 250,
    },
  ];

  for (const s of script) {
    applyShadowFill({
      operatorId,
      symbol: s.symbol,
      side: s.side,
      qty: s.qty,
      confidence: s.confidence,
      riskScore: s.riskScore,
      rationale: s.rationale,
      ts: base + s.offsetMin * 60_000,
    });
  }
  return getNightBundle(operatorId);
}
