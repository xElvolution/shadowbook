import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { appendAudit, listAudit } from "@/lib/audit/log";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, events: listAudit(session.operatorId) });
}

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as { action?: string; detail?: string };
  const ev = appendAudit({
    operatorId: session.operatorId,
    actor: session.handle,
    action: body.action || "client.event",
    detail: body.detail || "",
  });
  return NextResponse.json({ ok: true, event: ev });
}
