import fs from "fs";
import path from "path";

const DATA = path.join(process.cwd(), "data");
const FILE = path.join(DATA, "audit.json");

export interface AuditEvent {
  id: string;
  ts: number;
  operatorId?: string;
  actor: string;
  action: string;
  detail: string;
}

function ensure() {
  if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
}

export function appendAudit(ev: Omit<AuditEvent, "id" | "ts"> & { ts?: number }) {
  ensure();
  const list = fs.existsSync(FILE) ? (JSON.parse(fs.readFileSync(FILE, "utf8")) as AuditEvent[]) : [];
  const row: AuditEvent = {
    id: `aud_${list.length + 1}_${Date.now().toString(36)}`,
    ts: ev.ts ?? Date.now(),
    operatorId: ev.operatorId,
    actor: ev.actor,
    action: ev.action,
    detail: ev.detail,
  };
  list.push(row);
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
  return row;
}

export function listAudit(operatorId?: string): AuditEvent[] {
  ensure();
  if (!fs.existsSync(FILE)) return [];
  const list = JSON.parse(fs.readFileSync(FILE, "utf8")) as AuditEvent[];
  if (!operatorId) return list;
  return list.filter((e) => !e.operatorId || e.operatorId === operatorId);
}
