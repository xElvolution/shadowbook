import fs from "fs";
import path from "path";
import { fnv1a, stableId } from "../hash";
import { quoteFor } from "../market/quotes";
import { appendReceipt, bundleHashFor } from "../receipts/store";
import { getBook, getShadow, saveShadow, spawnShadowTwin } from "../book/sync";
import { scoreShadowIntent } from "../risk/gate";
import { getPolicy } from "../promote/policy";
import type { NightBundle, RToken, ShadowAccount, ShadowLeg, Side } from "../types";

const DATA = path.join(process.cwd(), "data");
const NIGHTS = path.join(DATA, "nights.json");
const FEE_BPS = 4;
const SLIPPAGE_BPS = 3;

function ensure() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
}

function readNights(): Record<string, NightBundle> {
  ensure();
  if (!fs.existsSync(NIGHTS)) return {};
  return JSON.parse(fs.readFileSync(NIGHTS, "utf8")) as Record<string, NightBundle>;
}

function writeNights(map: Record<string, NightBundle>) {
  ensure();
  fs.writeFileSync(NIGHTS, JSON.stringify(map, null, 2));
}

export function getNightBundle(operatorId: string): NightBundle | null {
  return readNights()[operatorId] ?? null;
}

export function saveNightBundle(operatorId: string, bundle: NightBundle) {
  const map = readNights();
  map[operatorId] = bundle;
  writeNights(map);
}

export function openNightBundle(operatorId: string, ts = Date.now()): NightBundle {
  let shadow = getShadow(operatorId);
  if (!shadow) shadow = spawnShadowTwin(operatorId, ts);
  const book = getBook(operatorId);
  const bundle: NightBundle = {
    id: stableId("night", `${operatorId}:${ts}`),
    operatorId,
    openedAt: ts,
    closedAt: null,
    twinOfBookId: book?.id ?? shadow.twinOfBookId,
    shadowAccountId: shadow.id,
    legs: [],
    receiptIds: [],
    bundleHash: null,
    liveOrdersDisabled: true,
  };
  saveNightBundle(operatorId, bundle);
  return bundle;
}

function applyPositionChange(
  shadow: ShadowAccount,
  symbol: RToken,
  side: Side,
  qty: number,
  price: number,
  fee: number,
): ShadowAccount {
  const positions = shadow.positions.map((p) => ({ ...p }));
  const idx = positions.findIndex((p) => p.symbol === symbol);
  let cash = shadow.cashUsdt;
  let realized = shadow.realizedPnl;

  if (side === "buy") {
    cash -= price * qty + fee;
    if (idx < 0) {
      positions.push({ symbol, qty, avgCost: price, mark: price });
    } else {
      const p = positions[idx];
      const total = p.qty + qty;
      p.avgCost = total === 0 ? 0 : (p.avgCost * p.qty + price * qty) / total;
      p.qty = total;
      p.mark = price;
    }
  } else {
    if (idx < 0 || positions[idx].qty < qty) {
      throw new Error(`Shadow lot underflow on ${symbol}`);
    }
    const p = positions[idx];
    realized += (price - p.avgCost) * qty;
    p.qty -= qty;
    cash += price * qty - fee;
    if (p.qty === 0) positions.splice(idx, 1);
  }

  return {
    ...shadow,
    positions,
    cashUsdt: +cash.toFixed(2),
    realizedPnl: +realized.toFixed(2),
    liveOrdersEnabled: false,
  };
}

export function feeFor(notional: number): number {
  return +((notional * FEE_BPS) / 10_000).toFixed(4);
}

/**
 * Apply a sized fill on the shadow twin ONLY.
 * Live Bitget order path is never called here.
 */
export function applyShadowFill(input: {
  operatorId: string;
  symbol: RToken;
  side: Side;
  qty: number;
  confidence: number;
  riskScore: number;
  rationale: string;
  ts?: number;
  skipRisk?: boolean;
}): ShadowLeg | null {
  const ts = input.ts ?? Date.now();
  let shadow = getShadow(input.operatorId);
  if (!shadow) shadow = spawnShadowTwin(input.operatorId, ts);

  let bundle = getNightBundle(input.operatorId);
  if (!bundle) bundle = openNightBundle(input.operatorId, ts);

  const quote = quoteFor(input.symbol, ts);
  const slip =
    input.side === "buy"
      ? quote.ask * (1 + SLIPPAGE_BPS / 10_000)
      : quote.bid * (1 - SLIPPAGE_BPS / 10_000);
  const fillPrice = +slip.toFixed(2);
  const policy = getPolicy(input.operatorId);

  if (!input.skipRisk) {
    const verdict = scoreShadowIntent(
      {
        symbol: input.symbol,
        side: input.side,
        sizedQty: input.qty,
        limitPrice: fillPrice,
        confidence: input.confidence,
      },
      policy,
      shadow,
    );
    if (!verdict.pass) {
      const blocked = appendReceipt({
        kind: "block",
        summary: `Blocked ${input.side.toUpperCase()} ${input.qty} ${input.symbol}: ${verdict.reasons.join("; ")}`,
        operatorId: input.operatorId,
        meta: { reasons: verdict.reasons, riskScore: verdict.riskScore },
        ts,
      });
      bundle.receiptIds.push(blocked.id);
      const leg: ShadowLeg = {
        id: stableId("leg", `${bundle.id}:${input.symbol}:block:${ts}`),
        symbol: input.symbol,
        side: input.side,
        qty: input.qty,
        fillPrice,
        notional: +(input.qty * fillPrice).toFixed(2),
        feeUsdt: 0,
        confidence: input.confidence,
        riskScore: verdict.riskScore,
        rationale: input.rationale,
        status: "blocked",
        receiptId: blocked.id,
        receiptHash: blocked.hash,
        ts,
      };
      bundle.legs.push(leg);
      sealBundle(bundle);
      saveNightBundle(input.operatorId, bundle);
      return leg;
    }
    input.riskScore = verdict.riskScore;
    if (verdict.cappedQty > 0 && verdict.cappedQty < input.qty) {
      input.qty = verdict.cappedQty;
    }
  }

  const notional = +(input.qty * fillPrice).toFixed(2);
  const feeUsdt = feeFor(notional);

  if (input.side === "buy" && shadow.cashUsdt < notional + feeUsdt) {
    const blocked = appendReceipt({
      kind: "block",
      summary: `Blocked buy ${input.symbol}: shadow cash insufficient`,
      operatorId: input.operatorId,
      ts,
    });
    bundle.receiptIds.push(blocked.id);
    sealBundle(bundle);
    saveNightBundle(input.operatorId, bundle);
    return null;
  }

  const legId = stableId("leg", `${bundle.id}:${input.symbol}:${input.side}:${ts}:${input.qty}`);
  const receipt = appendReceipt({
    kind: "shadow_fill",
    summary: `Shadow ${input.side.toUpperCase()} ${input.qty} ${input.symbol} @ ${fillPrice}`,
    operatorId: input.operatorId,
    meta: {
      legId,
      symbol: input.symbol,
      side: input.side,
      qty: input.qty,
      fillPrice,
      liveOrders: false,
      overnightWasLive: false,
    },
    ts,
  });

  const nextShadow = applyPositionChange(shadow, input.symbol, input.side, input.qty, fillPrice, feeUsdt);
  saveShadow(nextShadow);

  const leg: ShadowLeg = {
    id: legId,
    symbol: input.symbol,
    side: input.side,
    qty: input.qty,
    fillPrice,
    notional,
    feeUsdt,
    confidence: input.confidence,
    riskScore: input.riskScore,
    rationale: input.rationale,
    status: "pending",
    receiptId: receipt.id,
    receiptHash: receipt.hash,
    ts,
  };

  bundle.legs.push(leg);
  bundle.receiptIds.push(receipt.id);
  bundle.liveOrdersDisabled = true;
  sealBundle(bundle);
  saveNightBundle(input.operatorId, bundle);
  return leg;
}

export function sealBundle(bundle: NightBundle): string {
  const hashes = bundle.legs.map((l) => l.receiptHash);
  const bundleHash = bundleHashFor([
    bundle.id,
    ...hashes,
    ...bundle.legs.map((l) => `${l.symbol}:${l.side}:${l.qty}:${l.fillPrice}:${l.status}`),
  ]);
  bundle.bundleHash = bundleHash;
  bundle.closedAt = Date.now();
  return bundleHash;
}

export function pendingLegs(operatorId: string): ShadowLeg[] {
  const bundle = getNightBundle(operatorId);
  if (!bundle) return [];
  return bundle.legs.filter((l) => l.status === "pending" || l.status === "accepted");
}

export function allLegs(operatorId: string): ShadowLeg[] {
  return getNightBundle(operatorId)?.legs.slice() ?? [];
}

/** Re-sync shadow twin from live book snapshot (cash close freeze). */
export function syncShadowFromBook(operatorId: string, ts = Date.now()): ShadowAccount {
  return spawnShadowTwin(operatorId, ts);
}

export function shadowPnl(operatorId: string): { equity: number; unrealized: number; cash: number } {
  const shadow = getShadow(operatorId);
  if (!shadow) return { equity: 0, unrealized: 0, cash: 0 };
  const mtm = shadow.positions.reduce((s, p) => s + p.qty * p.mark, 0);
  return {
    cash: shadow.cashUsdt,
    unrealized: shadow.unrealizedPnl,
    equity: +(shadow.cashUsdt + mtm).toFixed(2),
  };
}

// silence unused in some builds
void fnv1a;
