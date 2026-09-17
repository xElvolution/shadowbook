"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MarketingShell } from "./marketing-shell";

const spring = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.85 };
const softSpring = { type: "spring" as const, stiffness: 240, damping: 28, mass: 0.9 };

const HEADLINE = ["Agents rehearse overnight.", "You promote at open."];

const STEPS = [
  {
    n: "01",
    owner: "You",
    title: "Import Bitget book",
    body: "Pull your live rToken lots once. Cash and holdings stay read-only on the night side.",
  },
  {
    n: "02",
    owner: "Agents",
    title: "Shadow twin night",
    body: "Agents size and fill against a live-priced twin. Zero live orders hit Bitget overnight.",
  },
  {
    n: "03",
    owner: "You",
    title: "Promote at open",
    body: "Morning board: accept or discard each leg. Dual-ack seals the path to live.",
  },
  {
    n: "04",
    owner: "System",
    title: "Sealed receipts",
    body: "Every fill, promote, and reject lands in a hash chain you can audit later.",
  },
];

const MOCK_LEGS = [
  {
    side: "BUY",
    qty: "12",
    symbol: "rAAPL",
    px: "214.60",
    notional: "$2,575",
    note: "Gap fade vs overnight mid",
    tone: "green" as const,
    state: "ready" as const,
  },
  {
    side: "SELL",
    qty: "40",
    symbol: "rNVDA",
    px: "118.25",
    notional: "$4,730",
    note: "Trim after twin breakout",
    tone: "neutral" as const,
    state: "pending" as const,
  },
  {
    side: "BUY",
    qty: "8",
    symbol: "rMSFT",
    px: "428.10",
    notional: "$3,425",
    note: "Add on twin pullback",
    tone: "green" as const,
    state: "pending" as const,
  },
];

function StaggerLine({
  text,
  delay,
  reduce,
}: {
  text: string;
  delay: number;
  reduce: boolean | null;
}) {
  return (
    <span className="hero-line-mask block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={reduce ? false : { y: "110%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ ...softSpring, delay }}
      >
        {text}
      </motion.span>
    </span>
  );
}

function PromoteMock({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.div
      className="hero-panel relative w-full overflow-hidden rounded-2xl border border-line2 bg-bge/80 shadow-[0_0_0_1px_rgba(197,180,255,0.1),0_28px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm"
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...softSpring, delay: 0.32 }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="label text-promote">Bitget morning board</p>
          <p className="mt-1 truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Promote · Shadow twin
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-mute">
            Dual-ack
          </span>
          <span className="hidden rounded-full bg-promote-dim px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-promote sm:inline-flex">
            Cash open
          </span>
        </div>
      </div>

      <div className="border-b border-line px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-mute">
          <span>
            Live cash <span className="tabular text-ink">$48,220</span>
            <span className="text-faint"> · 3 legs waiting</span>
          </span>
          <span className="tabular text-faint">policy a7c2e91f</span>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-surface/80 px-3 py-2.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-promote/50 bg-promote/20 text-[10px] text-promote">
            ✓
          </span>
          <span className="text-[12px] leading-4 text-mute">
            <span className="font-medium text-ink">Policy seal</span>
            {" · "}promote rails confirmed for live submit
          </span>
        </div>
      </div>

      <div className="space-y-2.5 p-3 sm:p-4">
        {MOCK_LEGS.map((leg, i) => (
          <motion.div
            key={leg.symbol}
            className={`rounded-xl border bg-surface px-3.5 py-3 sm:px-4 ${
              leg.tone === "green"
                ? "border-[rgba(61,214,140,0.28)]"
                : "border-line"
            }`}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.42 + i * 0.06 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-[-0.015em] text-ink">
                  <span className="uppercase text-mute">{leg.side}</span>{" "}
                  <span className="tabular">{leg.qty}</span> {leg.symbol}{" "}
                  <span className="text-mute">@ {leg.px}</span>
                </p>
                <p className="mt-1 text-[12px] leading-4 text-mute">{leg.note}</p>
                <p className="mt-1.5 text-[11px] text-faint">
                  <span className="tabular">{leg.notional}</span> notional
                  {leg.tone === "green" ? " · green candidate" : ""}
                  {leg.state === "ready" ? " · ready" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                    leg.state === "ready"
                      ? "bg-gain/15 text-gain"
                      : "bg-gain/10 text-gain"
                  }`}
                >
                  {leg.state === "ready" ? "Accepted" : "Promote"}
                </span>
                <span className="rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-loss/90">
                  Discard
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3.5 sm:px-5">
        <span className="inline-flex items-center rounded-full bg-promote px-3.5 py-2 text-[12px] font-semibold text-[#1a1408]">
          Promote 1 to live
        </span>
        <span className="inline-flex items-center rounded-full border border-line2 px-3.5 py-2 text-[12px] font-medium text-ink">
          Accept all green (2)
        </span>
        <span className="ml-auto hidden text-[11px] text-faint sm:inline">
          Rejected legs never touch live
        </span>
      </div>
    </motion.div>
  );
}

export function Landing() {
  const reduce = useReducedMotion();
  const childDelay = 0.055;

  return (
    <MarketingShell>
      <section className="landing-section mx-auto max-w-6xl px-5 pb-8 pt-14 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div className="min-w-0">
            <motion.p
              className="label text-accent"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0 }}
            >
              Bitget AI Hackathon S2 · tokenized US stocks
            </motion.p>

            <h1 className="mt-5 max-w-xl text-[40px] font-semibold leading-[1.06] tracking-[-0.038em] text-ink sm:text-[52px] lg:text-[56px]">
              {HEADLINE.map((line, i) => (
                <StaggerLine
                  key={line}
                  text={line}
                  delay={0.08 + i * 0.1}
                  reduce={reduce}
                />
              ))}
            </h1>

            <motion.p
              className="mt-6 max-w-md text-[16px] leading-7 text-mute"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.28 }}
            >
              Your live Bitget book of rAAPL, rNVDA, rTSLA, rMSFT, and rAMZN stays untouched while
              agents trade a live-priced shadow twin. Morning: promote or discard each sized
              rToken leg. No promote means the night never hit your holdings.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap gap-3"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.34 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/enter" className="btn-primary">
                  Open Shadowbook
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/enter?next=/onboarding" className="btn-ghost">
                  Import Bitget book
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <PromoteMock reduce={reduce} />
        </div>
      </section>

      <section className="landing-section mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={softSpring}
          >
            <p className="label text-accent">The overnight gap</p>
            <h2 className="mt-4 max-w-sm text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[34px]">
              Live books should sleep. Agents should not.
            </h2>
          </motion.div>
          <motion.div
            className="space-y-5 text-[15px] leading-7 text-mute sm:text-[16px]"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ ...softSpring, delay: childDelay }}
          >
            <p>
              Overnight ideas on Bitget rTokens usually mean either sitting out or risking the
              live book. Both are wrong when agents can rehearse against a twin that tracks mid.
            </p>
            <p>
              SHADOWBOOK keeps cash and lots frozen on Bitget while the shadow twin absorbs every
              sized fill. At cash open you decide what becomes real.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="landing-section mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={softSpring}
        >
          <p className="label text-accent">How it works</p>
          <h2 className="mt-4 max-w-lg text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[34px]">
            Four steps from Bitget import to sealed promote.
          </h2>
        </motion.div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.n}
              className="card flex flex-col p-5 sm:p-6"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ ...softSpring, delay: i * childDelay }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="tabular text-[13px] font-semibold text-accent">{step.n}</span>
                <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-faint">
                  {step.owner}
                </span>
              </div>
              <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.02em] text-ink">
                {step.title}
              </h3>
              <p className="mt-2 flex-1 text-[13px] leading-5 text-mute">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <section className="landing-section mx-auto max-w-6xl px-5 py-20 sm:py-24">
        <motion.div
          className="overflow-hidden rounded-2xl border border-line bg-surface/60 px-5 py-8 sm:px-8 sm:py-10"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={softSpring}
        >
          <p className="label text-center text-accent">Built for Bitget rTokens</p>
          <div className="mt-8 grid gap-8 text-center sm:grid-cols-3 sm:gap-6">
            {[
              { k: "Bitget venue", v: "rToken book import, live cash, morning promote path." },
              { k: "rToken twin", v: "Same lots. Live mid. Shadow fills only overnight." },
              { k: "Cash-open promote", v: "Line-item accept or discard with dual-ack seal." },
            ].map((item, i) => (
              <motion.div
                key={item.k}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: i * childDelay }}
              >
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">{item.k}</p>
                <p className="mx-auto mt-2 max-w-[220px] text-[13px] leading-5 text-mute">
                  {item.v}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="landing-section mx-auto max-w-6xl px-5 pb-28 pt-8 sm:pb-36">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={softSpring}
        >
          <p className="label text-promote">Ready at open</p>
          <h2 className="mt-4 text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[36px]">
            Rehearse the night. Promote what earns the book.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-mute">
            One primary path: enter as operator, import your Bitget book, let the twin run, then
            promote at cash open.
          </p>
          <div className="mt-9 flex justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/enter" className="btn-primary">
                Open Shadowbook
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </MarketingShell>
  );
}
