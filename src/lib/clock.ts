/** Lagos-aware session helpers for US cash vs Bitget rToken overnight. */

export function lagosParts(ts = Date.now()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date(ts)).map((p) => [p.type, p.value]),
  );
  return {
    weekday: parts.weekday ?? "",
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** US cash open ~14:30 Lagos, close ~21:00 Lagos (approx EST/EDT). */
export type SessionPhase = "cash_open" | "cash_close_window" | "overnight" | "weekend";

export function sessionPhase(ts = Date.now()): SessionPhase {
  const p = lagosParts(ts);
  if (p.weekday === "Sat" || p.weekday === "Sun") return "weekend";
  const mins = p.hour * 60 + p.minute;
  if (mins >= 14 * 60 + 30 && mins < 21 * 60) return "cash_open";
  if (mins >= 20 * 60 + 45 && mins < 21 * 60 + 15) return "cash_close_window";
  return "overnight";
}

export function phaseLabel(phase: SessionPhase): string {
  switch (phase) {
    case "cash_open":
      return "US cash open";
    case "cash_close_window":
      return "Cash close window";
    case "overnight":
      return "Overnight (rTokens live)";
    case "weekend":
      return "Weekend";
  }
}
