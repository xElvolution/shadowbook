import { fnv1a } from "../hash";
import type { PromotePolicy, RToken, ShadowAccount, Side } from "../types";

export interface RiskVerdict {
  pass: boolean;
  riskScore: number;
  reasons: string[];
  cappedQty: number;
}

export interface ShadowIntentDraft {
  symbol: RToken;
  side: Side;
  sizedQty: number;
  limitPrice: number;
  confidence: number;
}

/** Proof-of-Risk gate: allowlist, caps, confidence. Outside the model. */
export function scoreShadowIntent(
  intent: ShadowIntentDraft,
  policy: PromotePolicy,
  shadow: ShadowAccount,
): RiskVerdict {
  const reasons: string[] = [];
  let score = 0;
  const minConfidence = policy.minConfidence ?? 0.55;
  const maxRisk = policy.maxRiskScore ?? 0.72;
  const notional = intent.sizedQty * intent.limitPrice;

  if (!policy.allowlist.includes(intent.symbol)) {
    reasons.push(`${intent.symbol} is not on the promote allowlist`);
    score += 1;
  }

  if (intent.confidence < minConfidence) {
    reasons.push(`confidence ${intent.confidence.toFixed(2)} below floor ${minConfidence}`);
    score += 0.35;
  } else {
    score += (1 - intent.confidence) * 0.25;
  }

  if (notional > policy.maxNotional) {
    reasons.push(`notional ${notional.toFixed(0)} exceeds cap ${policy.maxNotional}`);
    score += 0.4;
  }

  if (intent.side === "buy" && notional > shadow.cashUsdt) {
    reasons.push("shadow cash cannot cover buy");
    score += 0.5;
  }

  if (intent.side === "sell") {
    const lot = shadow.positions.find((p) => p.symbol === intent.symbol);
    if (!lot || lot.qty < intent.sizedQty) {
      reasons.push("shadow lot too small for sell");
      score += 0.5;
    }
  }

  const lotValue = shadow.positions.reduce((s, p) => s + p.qty * p.avgCost, 0);
  const equity = shadow.cashUsdt + lotValue;
  const held = shadow.positions.find((p) => p.symbol === intent.symbol);
  const nameValue =
    (held?.qty ?? 0) * (held?.avgCost ?? intent.limitPrice) +
    (intent.side === "buy" ? notional : -notional);
  if (equity > 0 && nameValue / equity > 0.45) {
    reasons.push("name concentration above 45%");
    score += 0.2;
  }

  const riskScore = Math.min(1, +score.toFixed(3));
  const hardBlock = reasons.some(
    (r) =>
      r.includes("allowlist") ||
      r.includes("cannot cover") ||
      r.includes("too small") ||
      r.includes("exceeds cap"),
  );

  let cappedQty = intent.sizedQty;
  if (notional > policy.maxNotional && intent.limitPrice > 0) {
    cappedQty = Math.floor(policy.maxNotional / intent.limitPrice);
  }

  const pass = !hardBlock && riskScore <= maxRisk;
  return {
    pass,
    riskScore,
    reasons: pass ? (reasons.length ? reasons : ["risk pass"]) : reasons,
    cappedQty: Math.max(0, cappedQty),
  };
}

/** @deprecated alias */
export const scoreIntent = scoreShadowIntent;

export function policySealHash(policy: PromotePolicy): string {
  return fnv1a(JSON.stringify(policy));
}
