import { DEFAULT_POLICY, readSettings, writeSettings } from "../operators/store";
import type { PromotePolicy } from "../types";

export { DEFAULT_POLICY };

export function getPolicy(operatorId: string): PromotePolicy {
  return readSettings(operatorId).policy;
}

export function updatePolicy(operatorId: string, patch: Partial<PromotePolicy>): PromotePolicy {
  const s = readSettings(operatorId);
  s.policy = { ...s.policy, ...patch };
  writeSettings(operatorId, s);
  return s.policy;
}

/** Auto-promote candidates: confidence ≥ τ and risk pass. Human dual-ack still required if policy says so. */
export function autoPromoteCandidates(
  legs: { confidence: number; riskScore: number; status: string; notional: number }[],
  policy: PromotePolicy,
) {
  return legs.filter(
    (l) =>
      l.status === "pending" &&
      l.confidence >= policy.autoThreshold &&
      l.riskScore < 0.35 &&
      l.notional <= policy.maxNotional,
  );
}
