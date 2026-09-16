/** Compatibility shim. Prefer operator-scoped stores under book/, shadow/, receipts/. */
export { getBook, getShadow, spawnShadowTwin, seedBitgetBook } from "./book/sync";
export { getNightBundle, applyShadowFill, pendingLegs, allLegs } from "./shadow/ledger";
export { appendReceipt, listReceipts } from "./receipts/store";
