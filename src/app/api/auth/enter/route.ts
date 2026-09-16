import { NextResponse } from "next/server";
import { upsertOperator } from "@/lib/operators/store";
import { signSession, sessionCookieOptions } from "@/lib/operators/session-token";
import { appendAudit } from "@/lib/audit/log";
import { isOnboardingComplete } from "@/lib/onboarding";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    displayName?: string;
    handle?: string;
    email?: string;
  };
  const displayName = (body.displayName || "").trim();
  const handle = (body.handle || "").trim();
  if (!displayName || !handle) {
    return NextResponse.json({ ok: false, error: "Name and handle required." }, { status: 400 });
  }
  const operator = upsertOperator({
    displayName,
    handle,
    email: body.email?.trim() || undefined,
  });
  const token = signSession({
    operatorId: operator.id,
    handle: operator.handle,
    displayName: operator.displayName,
    issuedAt: Date.now(),
  });
  appendAudit({
    operatorId: operator.id,
    actor: operator.handle,
    action: "auth.enter",
    detail: `Operator ${operator.handle} entered Shadowbook.`,
  });
  const res = NextResponse.json({
    ok: true,
    operator,
    onboarded: isOnboardingComplete(operator.id),
  });
  res.cookies.set(sessionCookieOptions(token));
  return res;
}
