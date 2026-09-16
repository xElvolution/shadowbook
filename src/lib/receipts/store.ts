import fs from "fs";
import path from "path";
import { chainHash, fnv1a, shaLike } from "../hash";
import type { Receipt, ReceiptKind } from "../types";

const DATA = path.join(process.cwd(), "data");
const FILE = path.join(DATA, "receipts.json");

function ensure() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
}

export function listReceipts(operatorId?: string): Receipt[] {
  ensure();
  if (!fs.existsSync(FILE)) return [];
  const all = JSON.parse(fs.readFileSync(FILE, "utf8")) as Receipt[];
  if (!operatorId) return all;
  return all.filter((r) => !r.operatorId || r.operatorId === operatorId);
}

function tipHash(operatorId?: string): string {
  const list = listReceipts(operatorId);
  if (list.length === 0) return "genesis00000000";
  return list[list.length - 1].hash;
}

export function appendReceipt(input: {
  kind: ReceiptKind;
  summary: string;
  operatorId?: string;
  meta?: Record<string, unknown>;
  ts?: number;
}): Receipt {
  ensure();
  const ts = input.ts ?? Date.now();
  const payload = JSON.stringify({
    kind: input.kind,
    summary: input.summary,
    meta: input.meta ?? {},
    ts,
  });
  const payloadHash = shaLike(payload);
  const prevHash = tipHash(input.operatorId);
  const hash = chainHash(prevHash, payloadHash);
  const receipt: Receipt = {
    id: `rcpt_${fnv1a(hash + String(ts))}`,
    hash,
    prevHash,
    kind: input.kind,
    payloadHash,
    ts,
    operatorId: input.operatorId,
    summary: input.summary,
    meta: input.meta,
  };
  const all = listReceipts();
  all.push(receipt);
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
  return receipt;
}

export function bundleHashFor(hashes: string[]): string {
  return shaLike(hashes.join("|"));
}
