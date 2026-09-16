import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { ensureLivedInNight } from "@/lib/shadow/seed-night";
import { allLegs, getNightBundle } from "@/lib/shadow/ledger";
import { getShadow } from "@/lib/book/sync";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  ensureLivedInNight(session.operatorId);
  return NextResponse.json({
    ok: true,
    bundle: getNightBundle(session.operatorId),
    legs: allLegs(session.operatorId),
    shadow: getShadow(session.operatorId),
  });
}
