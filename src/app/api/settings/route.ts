import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { listOperators, readSettings, writeSettings } from "@/lib/operators/store";
import { updatePolicy } from "@/lib/promote/policy";
import { appendReceipt } from "@/lib/receipts/store";
import type { PromotePolicy } from "@/lib/types";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    settings: readSettings(session.operatorId),
    operators: listOperators(),
  });
}

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as {
    policy?: Partial<PromotePolicy>;
    dualAckSecondHandle?: string;
  };
  if (body.policy) {
    const policy = updatePolicy(session.operatorId, body.policy);
    appendReceipt({
      kind: "policy",
      summary: "Promote policy updated.",
      operatorId: session.operatorId,
      meta: { policy },
    });
    return NextResponse.json({ ok: true, policy });
  }
  if (body.dualAckSecondHandle !== undefined) {
    const s = readSettings(session.operatorId);
    s.dualAckSecondHandle = body.dualAckSecondHandle;
    writeSettings(session.operatorId, s);
    return NextResponse.json({ ok: true, settings: s });
  }
  return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
}
