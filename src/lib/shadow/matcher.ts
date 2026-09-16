/**
 * Shadow matcher: paper fills against live mid/ask with transparent slippage.
 * Rick sharpens sizing here. Agents never call live Bitget order API overnight.
 */
export { applyShadowFill, getNightBundle, pendingLegs, allLegs } from "./ledger";
