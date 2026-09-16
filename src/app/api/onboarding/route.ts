import { NextResponse } from "next/server";
import { readSession } from "@/lib/operators/session";
import { completeOnboarding } from "@/lib/onboarding";
import { getBook, getShadow, seedBitgetBook, spawnShadowTwin } from "@/lib/book/sync";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({
    ok: true,
    book: getBook(session.operatorId),
    shadow: getShadow(session.operatorId),
  });
}

export async function POST(req: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json()) as { step?: string };
  if (body.step === "import") {
    const book = seedBitgetBook(session.operatorId);
    return NextResponse.json({ ok: true, book });
  }
  if (body.step === "spawn") {
    const shadow = spawnShadowTwin(session.operatorId);
    return NextResponse.json({ ok: true, shadow });
  }
  if (body.step === "finish") {
    completeOnboarding(session.operatorId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Unknown step." }, { status: 400 });
}
