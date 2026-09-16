import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { getBook, getShadow } from "@/lib/book/sync";
import { ensureLivedInNight } from "@/lib/shadow/seed-night";
import { getNightBundle, pendingLegs, shadowPnl } from "@/lib/shadow/ledger";
import { isOnboardingComplete } from "@/lib/onboarding";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  if (isOnboardingComplete(session.operatorId)) {
    ensureLivedInNight(session.operatorId);
  }
  const book = getBook(session.operatorId);
  const shadow = getShadow(session.operatorId);
  const bundle = getNightBundle(session.operatorId);
  const waiting = pendingLegs(session.operatorId);
  const pnl = shadowPnl(session.operatorId);
  const shadowPnlTotal = +((shadow?.realizedPnl ?? 0) + pnl.unrealized).toFixed(2);
  return NextResponse.json({
    ok: true,
    book,
    shadow,
    bundle,
    waitingCount: waiting.length,
    shadowPnl: shadowPnlTotal,
    equity: pnl.equity,
  });
}
