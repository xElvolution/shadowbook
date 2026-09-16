import fs from "fs";
import path from "path";
import { fnv1a } from "../hash";
import type { Operator, PromotePolicy, AppSettings, RToken } from "../types";
import { UNIVERSE } from "../types";

const DATA = path.join(process.cwd(), "data");
const OPS = path.join(DATA, "operators.json");
const SETTINGS = path.join(DATA, "settings.json");

function ensure() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
}

export const DEFAULT_POLICY: PromotePolicy = {
  autoThreshold: 0.82,
  maxNotional: 25000,
  allowlist: [...UNIVERSE] as RToken[],
  dualAckRequired: true,
  morningDigest: true,
};

export function listOperators(): Operator[] {
  ensure();
  if (!fs.existsSync(OPS)) return [];
  return JSON.parse(fs.readFileSync(OPS, "utf8")) as Operator[];
}

export function saveOperators(ops: Operator[]) {
  ensure();
  fs.writeFileSync(OPS, JSON.stringify(ops, null, 2));
}

export function upsertOperator(input: {
  displayName: string;
  handle: string;
  email?: string;
}): Operator {
  const ops = listOperators();
  const handle = input.handle.replace(/^@/, "").toLowerCase().trim();
  const existing = ops.find((o) => o.handle === handle);
  if (existing) {
    existing.displayName = input.displayName.trim() || existing.displayName;
    if (input.email) existing.email = input.email;
    saveOperators(ops);
    return existing;
  }
  const op: Operator = {
    id: `op_${fnv1a(`${handle}:${Date.now()}`)}`,
    handle,
    displayName: input.displayName.trim() || handle,
    email: input.email,
    role: ops.length === 0 ? "admin" : "operator",
    createdAt: Date.now(),
  };
  ops.push(op);
  saveOperators(ops);
  return op;
}

export function getOperator(id: string): Operator | undefined {
  return listOperators().find((o) => o.id === id);
}

export function readSettings(operatorId: string): AppSettings {
  ensure();
  const all = fs.existsSync(SETTINGS)
    ? (JSON.parse(fs.readFileSync(SETTINGS, "utf8")) as Record<string, AppSettings>)
    : {};
  return (
    all[operatorId] ?? {
      operators: listOperators(),
      policy: { ...DEFAULT_POLICY },
      onboardingComplete: false,
    }
  );
}

export function writeSettings(operatorId: string, settings: AppSettings) {
  ensure();
  const all = fs.existsSync(SETTINGS)
    ? (JSON.parse(fs.readFileSync(SETTINGS, "utf8")) as Record<string, AppSettings>)
    : {};
  all[operatorId] = settings;
  fs.writeFileSync(SETTINGS, JSON.stringify(all, null, 2));
}

export function isOnboardingComplete(operatorId: string): boolean {
  return readSettings(operatorId).onboardingComplete;
}

export function markOnboardingComplete(operatorId: string) {
  const s = readSettings(operatorId);
  s.onboardingComplete = true;
  writeSettings(operatorId, s);
}
