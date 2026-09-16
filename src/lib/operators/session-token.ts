import { fnv1a } from "../hash";
import type { SessionPayload } from "../types";

export const SESSION_COOKIE = "shadowbook_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 30;

function secret(): string {
  return process.env.SHADOWBOOK_SESSION_SECRET || "shadowbook-local-session-v1";
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function signSession(payload: SessionPayload): string {
  const body = toBase64Url(JSON.stringify(payload));
  const sig = fnv1a(`${body}.${secret()}`);
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (fnv1a(`${body}.${secret()}`) !== sig) return null;
  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (!payload.operatorId || !payload.handle || !payload.issuedAt) return null;
    if (Date.now() - payload.issuedAt > TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
