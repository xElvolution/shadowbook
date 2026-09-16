import fs from "fs";
import path from "path";
import { fnv1a } from "../hash";
import { markPositions, quoteFor } from "../market/quotes";
import type { BookSnapshot, Position, RToken, ShadowAccount } from "../types";
import { UNIVERSE } from "../types";
import { appendReceipt } from "../receipts/store";

const DATA = path.join(process.cwd(), "data");
const BOOKS = path.join(DATA, "books.json");
const SHADOWS = path.join(DATA, "shadows.json");

function ensure() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
}

function readMap<T>(file: string): Record<string, T> {
  ensure();
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, T>;
}

function writeMap<T>(file: string, map: Record<string, T>) {
  ensure();
  fs.writeFileSync(file, JSON.stringify(map, null, 2));
}

/** Default Bitget-style book for first import (lived-in seed). */
export function seedBitgetBook(operatorId: string, ts = Date.now()): BookSnapshot {
  const lots: Record<RToken, { qty: number; avgCost: number }> = {
    rAAPL: { qty: 42, avgCost: 221.5 },
    rNVDA: { qty: 65, avgCost: 136.2 },
    rTSLA: { qty: 28, avgCost: 241.0 },
    rMSFT: { qty: 18, avgCost: 415.4 },
    rAMZN: { qty: 35, avgCost: 191.8 },
  };
  const positions: Position[] = UNIVERSE.map((symbol) => {
    const lot = lots[symbol];
    const mark = quoteFor(symbol, ts).mid;
    return { symbol, qty: lot.qty, avgCost: lot.avgCost, mark };
  });
  const snap: BookSnapshot = {
    id: `book_${fnv1a(`${operatorId}:${ts}`)}`,
    operatorId,
    syncedAt: ts,
    positions,
    cashUsdt: 18450.0,
    source: "bitget_import",
  };
  const books = readMap<BookSnapshot>(BOOKS);
  books[operatorId] = snap;
  writeMap(BOOKS, books);
  appendReceipt({
    kind: "sync",
    summary: `Imported Bitget book (${positions.length} rToken lots, ${snap.cashUsdt.toFixed(0)} USDT cash).`,
    operatorId,
    meta: { bookId: snap.id },
    ts,
  });
  return snap;
}

export function getBook(operatorId: string): BookSnapshot | null {
  const books = readMap<BookSnapshot>(BOOKS);
  const b = books[operatorId];
  if (!b) return null;
  return {
    ...b,
    positions: markPositions(b.positions),
  };
}

export function spawnShadowTwin(operatorId: string, ts = Date.now()): ShadowAccount {
  let book = getBook(operatorId);
  if (!book) book = seedBitgetBook(operatorId, ts);
  const twin: ShadowAccount = {
    id: `sh_${fnv1a(`${book.id}:twin:${ts}`)}`,
    operatorId,
    twinOfBookId: book.id,
    positions: book.positions.map((p) => ({ ...p })),
    cashUsdt: book.cashUsdt,
    realizedPnl: 0,
    unrealizedPnl: 0,
    openedAt: ts,
  };
  const shadows = readMap<ShadowAccount>(SHADOWS);
  shadows[operatorId] = twin;
  writeMap(SHADOWS, shadows);
  appendReceipt({
    kind: "sync",
    summary: `Shadow twin spawned from ${book.id}. Live book stays read-only overnight.`,
    operatorId,
    meta: { shadowId: twin.id, bookId: book.id },
    ts,
  });
  return twin;
}

export function getShadow(operatorId: string): ShadowAccount | null {
  const shadows = readMap<ShadowAccount>(SHADOWS);
  const s = shadows[operatorId];
  if (!s) return null;
  const positions = markPositions(s.positions);
  let unrealized = 0;
  for (const p of positions) {
    unrealized += (p.mark - p.avgCost) * p.qty;
  }
  return { ...s, positions, unrealizedPnl: +unrealized.toFixed(2) };
}

export function saveShadow(account: ShadowAccount) {
  const shadows = readMap<ShadowAccount>(SHADOWS);
  shadows[account.operatorId] = account;
  writeMap(SHADOWS, shadows);
}

export function applyLivePromote(
  operatorId: string,
  symbol: RToken,
  side: "buy" | "sell",
  qty: number,
  price: number,
) {
  const books = readMap<BookSnapshot>(BOOKS);
  const book = books[operatorId];
  if (!book) return null;
  const pos = book.positions.find((p) => p.symbol === symbol);
  if (!pos) return null;
  if (side === "buy") {
    const newQty = pos.qty + qty;
    pos.avgCost = (pos.avgCost * pos.qty + price * qty) / newQty;
    pos.qty = newQty;
    book.cashUsdt -= price * qty;
  } else {
    pos.qty = Math.max(0, pos.qty - qty);
    book.cashUsdt += price * qty;
  }
  book.syncedAt = Date.now();
  books[operatorId] = book;
  writeMap(BOOKS, books);
  return getBook(operatorId);
}
