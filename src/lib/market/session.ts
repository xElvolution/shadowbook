import { phaseLabel, sessionPhase, type SessionPhase } from "../clock";
import { bookQuotes } from "./quotes";

export function marketStrip(ts = Date.now()) {
  const phase = sessionPhase(ts) as SessionPhase;
  const quotes = bookQuotes(ts);
  return {
    phase,
    label: phaseLabel(phase),
    quotes,
    rTokenLive: phase === "overnight" || phase === "cash_open" || phase === "cash_close_window",
    promoteWindow: phase === "cash_open" || phase === "cash_close_window",
  };
}
