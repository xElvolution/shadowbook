import { isOnboardingComplete, markOnboardingComplete } from "./operators/store";
import { getBook, seedBitgetBook, spawnShadowTwin, getShadow } from "./book/sync";
import { ensureLivedInNight } from "./shadow/seed-night";
import { appendAudit } from "./audit/log";

export { isOnboardingComplete };

export function completeOnboarding(operatorId: string) {
  if (!getBook(operatorId)) seedBitgetBook(operatorId);
  if (!getShadow(operatorId)) spawnShadowTwin(operatorId);
  ensureLivedInNight(operatorId);
  markOnboardingComplete(operatorId);
  appendAudit({
    operatorId,
    actor: "operator",
    action: "onboarding.complete",
    detail: "Bitget book imported; shadow twin spawned; night legs sized.",
  });
}
