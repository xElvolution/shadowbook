import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { runNightCycle } from "@/lib/shadow/night";
import { getBook } from "@/lib/book/sync";
import { allLegs } from "@/lib/shadow/ledger";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  const liveBefore = getBook(session.operatorId);
  const result = runNightCycle(session.operatorId);
  const liveAfter = getBook(session.operatorId);

  return NextResponse.json({
    ok: true,
    nightId: result.bundle.id,
    bundleHash: result.bundle.bundleHash,
    fillCount: result.fillCount,
    blocked: result.blocked,
    liveOrdersDisabled: result.liveOrdersDisabled,
    liveBookUntouched: result.liveBookUntouched,
    liveCashBefore: liveBefore?.cashUsdt ?? null,
    liveCashAfter: liveAfter?.cashUsdt ?? null,
    legs: allLegs(session.operatorId).filter((l) => l.status !== "blocked" || true),
    bundle: result.bundle,
  });
}
