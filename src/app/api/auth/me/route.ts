import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { getOperator, isOnboardingComplete, readSettings } from "@/lib/operators/store";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false, operator: null });
  const operator = getOperator(session.operatorId);
  if (!operator) return NextResponse.json({ ok: false, operator: null });
  return NextResponse.json({
    ok: true,
    operator,
    onboarded: isOnboardingComplete(operator.id),
    settings: readSettings(operator.id),
  });
}
