import { NextResponse } from "next/server";
import { marketStrip } from "@/lib/market/session";

export async function GET() {
  return NextResponse.json({ ok: true, ...marketStrip() });
}
