import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./session-token";
import type { SessionPayload } from "../types";

export {
  SESSION_COOKIE,
  signSession,
  verifySession,
  sessionCookieOptions,
  clearSessionCookieOptions,
} from "./session-token";

export async function readSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}
