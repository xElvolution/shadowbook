import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { ensureLivedInNight } from "@/lib/shadow/seed-night";
import { allLegs, pendingLegs } from "@/lib/shadow/ledger";
import { acceptLegsLocal, promoteLegs, rejectLegs } from "@/lib/promote/engine";
import { autoPromoteCandidates, getPolicy } from "@/lib/promote/policy";
import { appendAudit } from "@/lib/audit/log";
import { getBook } from "@/lib/book/sync";
import { policySealHash } from "@/lib/risk/gate";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  ensureLivedInNight(session.operatorId);
  const policy = getPolicy(session.operatorId);
  const legs = allLegs(session.operatorId);
  const pending = pendingLegs(session.operatorId);
  return NextResponse.json({
    ok: true,
    legs,
    pending,
    policy,
    policyHash: policySealHash(policy),
    greenCandidates: autoPromoteCandidates(pending, policy),
    live: getBook(session.operatorId),
  });
}

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as {
    action?: "accept" | "reject" | "promote" | "accept_greens";
    legIds?: string[];
    primaryAck?: string;
    secondaryAck?: string;
    policySeal?: boolean;
  };

  if (body.action === "accept") {
    const accepted = acceptLegsLocal(session.operatorId, body.legIds || []);
    return NextResponse.json({ ok: true, accepted });
  }

  if (body.action === "reject") {
    const rejected = rejectLegs(
      session.operatorId,
      body.legIds || [],
      body.primaryAck || session.handle,
    );
    appendAudit({
      operatorId: session.operatorId,
      actor: session.handle,
      action: "promote.reject",
      detail: `Rejected ${rejected.length} leg(s). Live book clean.`,
    });
    return NextResponse.json({
      ok: true,
      rejected,
      live: getBook(session.operatorId),
    });
  }

  if (body.action === "promote" || body.action === "accept_greens") {
    const policy = getPolicy(session.operatorId);
    const legIds =
      body.action === "accept_greens"
        ? autoPromoteCandidates(pendingLegs(session.operatorId), policy).map(
            (l) => (l as { id?: string }).id || "",
          ).filter(Boolean)
        : body.legIds || [];

    // autoPromoteCandidates returns filtered legs without id if type is weak - use pending filter
    const ids =
      body.action === "accept_greens"
        ? pendingLegs(session.operatorId)
            .filter(
              (l) =>
                l.confidence >= policy.autoThreshold &&
                l.riskScore < 0.35 &&
                l.notional <= policy.maxNotional,
            )
            .map((l) => l.id)
        : legIds;

    const liveBefore = getBook(session.operatorId);
    const result = promoteLegs({
      operatorId: session.operatorId,
      legIds: ids,
      primaryAck: body.primaryAck || session.handle,
      secondaryAck: body.secondaryAck,
      policySeal: body.policySeal ?? true,
    });
    if (result.ok) {
      appendAudit({
        operatorId: session.operatorId,
        actor: session.handle,
        action: "promote.submit",
        detail: `Promoted ${result.promoted.length} leg(s) to live after dual-ack.`,
      });
    }
    return NextResponse.json(
      {
        ...result,
        liveBefore,
        live: getBook(session.operatorId),
      },
      { status: result.ok ? 200 : 400 },
    );
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
