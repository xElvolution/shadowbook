import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { listReceipts } from "@/lib/receipts/store";
import { listAudit } from "@/lib/audit/log";
import { ensureLivedInNight } from "@/lib/shadow/seed-night";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  ensureLivedInNight(session.operatorId);
  return NextResponse.json({
    ok: true,
    receipts: listReceipts(session.operatorId).slice().reverse(),
    audit: listAudit(session.operatorId).slice().reverse(),
  });
}
