import { applyLivePromote, getBook, getShadow } from "../book/sync";
import { appendReceipt } from "../receipts/store";
import { getNightBundle, saveNightBundle } from "../shadow/ledger";
import { readSettings } from "../operators/store";
import { policySealHash } from "../risk/gate";
import { fnv1a } from "../hash";
import type { ShadowLeg } from "../types";

export interface PromoteRequest {
  operatorId: string;
  legIds: string[];
  primaryAck: string;
  secondaryAck?: string;
  /** Policy seal ack (operator confirms current promote policy). */
  policySeal?: boolean;
}

export interface PromoteResult {
  ok: boolean;
  error?: string;
  promoted: ShadowLeg[];
  liveOrderIds: string[];
  dualAck?: {
    operatorAck: string;
    secondaryAck?: string;
    policyHash: string;
    policySeal: boolean;
  };
}

/**
 * Promote engine: accepted shadow legs → live book.
 * Dual-ack = operator ack + policy seal (and optional second handle).
 * Paper live path when Bitget keys absent. Never pretends overnight was live.
 */
export function promoteLegs(req: PromoteRequest): PromoteResult {
  const settings = readSettings(req.operatorId);
  const policy = settings.policy;
  const policyHash = policySealHash(policy);
  const bundle = getNightBundle(req.operatorId);
  if (!bundle) {
    return { ok: false, error: "No night bundle open.", promoted: [], liveOrderIds: [] };
  }

  const primary = (req.primaryAck || "").trim();
  if (!primary) {
    return { ok: false, error: "Operator ack required before live submit.", promoted: [], liveOrderIds: [] };
  }

  if (policy.dualAckRequired) {
    const secondary = (req.secondaryAck || "").trim();
    const sealed = req.policySeal === true || secondary.toLowerCase() === `seal:${policyHash}`;
    const twoHandles =
      Boolean(secondary) &&
      secondary.toLowerCase() !== primary.toLowerCase() &&
      !secondary.toLowerCase().startsWith("seal:");

    if (!sealed && !twoHandles) {
      return {
        ok: false,
        error:
          "Dual-ack required: confirm operator ack plus policy seal (policySeal:true) or a second distinct handle.",
        promoted: [],
        liveOrderIds: [],
      };
    }
  }

  const hasBitget =
    Boolean(process.env.BITGET_API_KEY) && Boolean(process.env.BITGET_API_SECRET);
  const mode = hasBitget ? "bitget" : "paper";

  const promoted: ShadowLeg[] = [];
  const liveOrderIds: string[] = [];

  for (const id of req.legIds) {
    const leg = bundle.legs.find((l) => l.id === id);
    if (!leg) continue;
    if (leg.status !== "pending" && leg.status !== "accepted") continue;

    if (!policy.allowlist.includes(leg.symbol)) {
      appendReceipt({
        kind: "block",
        summary: `Promote blocked: ${leg.symbol} not on allowlist.`,
        operatorId: req.operatorId,
        meta: { legId: leg.id },
      });
      continue;
    }
    if (leg.notional > policy.maxNotional) {
      appendReceipt({
        kind: "block",
        summary: `Promote blocked: ${leg.symbol} notional ${leg.notional} exceeds max ${policy.maxNotional}.`,
        operatorId: req.operatorId,
        meta: { legId: leg.id },
      });
      continue;
    }

    const liveId = `live_${fnv1a(`${leg.id}:${Date.now()}`)}`;
    // Map shadow → live (paper book if no Bitget keys)
    applyLivePromote(req.operatorId, leg.symbol, leg.side, leg.qty, leg.fillPrice);
    leg.status = "promoted";
    leg.liveOrderId = liveId;
    promoted.push(leg);
    liveOrderIds.push(liveId);

    appendReceipt({
      kind: "promote",
      summary: `Promoted ${leg.side.toUpperCase()} ${leg.qty} ${leg.symbol} → live ${liveId} (${mode})`,
      operatorId: req.operatorId,
      meta: {
        legId: leg.id,
        shadowReceipt: leg.receiptHash,
        liveOrderId: liveId,
        mode,
        overnightWasLive: false,
        primaryAck: primary,
        secondaryAck: req.secondaryAck,
        policyHash,
        policySeal: req.policySeal === true,
      },
    });
  }

  saveNightBundle(req.operatorId, bundle);
  getShadow(req.operatorId);
  getBook(req.operatorId);

  return {
    ok: true,
    promoted,
    liveOrderIds,
    dualAck: {
      operatorAck: primary,
      secondaryAck: req.secondaryAck,
      policyHash,
      policySeal: req.policySeal === true || Boolean(req.secondaryAck),
    },
  };
}

/** Rejected legs never touch live. Sealed reject receipts only. */
export function rejectLegs(operatorId: string, legIds: string[], ack: string): ShadowLeg[] {
  const bundle = getNightBundle(operatorId);
  if (!bundle) return [];
  const rejected: ShadowLeg[] = [];
  for (const id of legIds) {
    const leg = bundle.legs.find((l) => l.id === id);
    if (!leg || (leg.status !== "pending" && leg.status !== "accepted")) continue;
    leg.status = "rejected";
    rejected.push(leg);
    appendReceipt({
      kind: "reject",
      summary: `Discarded shadow leg ${leg.side.toUpperCase()} ${leg.qty} ${leg.symbol}. Live book unchanged.`,
      operatorId,
      meta: { legId: leg.id, ack, touchedLive: false },
    });
  }
  saveNightBundle(operatorId, bundle);
  return rejected;
}

export function acceptLegsLocal(operatorId: string, legIds: string[]): ShadowLeg[] {
  const bundle = getNightBundle(operatorId);
  if (!bundle) return [];
  const out: ShadowLeg[] = [];
  for (const id of legIds) {
    const leg = bundle.legs.find((l) => l.id === id);
    if (!leg || leg.status !== "pending") continue;
    leg.status = "accepted";
    out.push(leg);
  }
  saveNightBundle(operatorId, bundle);
  return out;
}
