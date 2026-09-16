/** SHADOWBOOK core types. Author: XElvolution */

export type Side = "buy" | "sell";
export type RToken = "rAAPL" | "rNVDA" | "rTSLA" | "rMSFT" | "rAMZN";
export type ReceiptKind =
  | "shadow_fill"
  | "promote"
  | "reject"
  | "block"
  | "sync"
  | "policy";
export type LegStatus = "pending" | "accepted" | "rejected" | "promoted" | "blocked";
export type QuoteSession = "live" | "stale" | "closed";

export const UNIVERSE: RToken[] = ["rAAPL", "rNVDA", "rTSLA", "rMSFT", "rAMZN"];

export interface Position {
  symbol: RToken;
  qty: number;
  avgCost: number;
  mark: number;
}

export interface Quote {
  symbol: RToken;
  mid: number;
  bid: number;
  ask: number;
  changePct: number;
  ts: number;
  session: QuoteSession;
}

export interface BookSnapshot {
  id: string;
  operatorId: string;
  syncedAt: number;
  positions: Position[];
  cashUsdt: number;
  source: "bitget_import" | "seed" | "paper";
}

export interface ShadowAccount {
  id: string;
  operatorId: string;
  twinOfBookId: string;
  positions: Position[];
  cashUsdt: number;
  realizedPnl: number;
  unrealizedPnl: number;
  openedAt: number;
  /** Night agent never enables live Bitget orders. */
  liveOrdersEnabled?: false;
}

export interface ShadowLeg {
  id: string;
  symbol: RToken;
  side: Side;
  qty: number;
  fillPrice: number;
  notional: number;
  feeUsdt: number;
  confidence: number;
  riskScore: number;
  rationale: string;
  status: LegStatus;
  receiptId: string;
  receiptHash: string;
  liveOrderId?: string;
  ts: number;
}

export interface NightBundle {
  id: string;
  operatorId: string;
  openedAt: number;
  closedAt: number | null;
  twinOfBookId: string;
  shadowAccountId: string;
  legs: ShadowLeg[];
  receiptIds: string[];
  bundleHash: string | null;
  /** Hard rule: live Bitget order API disabled for overnight agent. */
  liveOrdersDisabled: true;
  /** Optional UI hint; computed at read time when absent. */
  shadowPnl?: number;
}

export interface Receipt {
  id: string;
  hash: string;
  prevHash: string;
  kind: ReceiptKind;
  payloadHash: string;
  ts: number;
  operatorId?: string;
  summary: string;
  meta?: Record<string, unknown>;
}

export interface PromotePolicy {
  autoThreshold: number;
  maxNotional: number;
  allowlist: RToken[];
  dualAckRequired: boolean;
  morningDigest: boolean;
  minConfidence?: number;
  maxRiskScore?: number;
}

export interface Operator {
  id: string;
  handle: string;
  displayName: string;
  email?: string;
  role: "admin" | "operator";
  createdAt: number;
}

export interface SessionPayload {
  operatorId: string;
  handle: string;
  displayName: string;
  issuedAt: number;
}

export interface AppSettings {
  operators: Operator[];
  policy: PromotePolicy;
  onboardingComplete: boolean;
  dualAckSecondHandle?: string;
}

/** Intent used by night agent + risk gate before shadow fill. */
export interface Intent {
  id: string;
  symbol: RToken;
  side: Side;
  sizedQty: number;
  limitPrice: number;
  confidence: number;
  riskScore: number;
  rationale: string;
  ts: number;
}
