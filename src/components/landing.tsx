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
    <span className="hero-line-mask block overflow-hidden pb-[0.06em]">
      <motion.span
        className="block"
        initial={reduce ? false : { y: "112%", opacity: 0 }}
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
      className="hero-panel relative w-full overflow-hidden rounded-2xl border border-line2 bg-bge/85 shadow-[0_0_0_1px_rgba(197,180,255,0.1),0_32px_90px_rgba(0,0,0,0.55)] backdrop-blur-sm"
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...softSpring, delay: 0.42 }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />

      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6">
        <div className="min-w-0">
          <p className="label text-promote">Bitget morning board</p>
          <p className="mt-1 truncate text-[16px] font-semibold tracking-[-0.02em] text-ink">
            Promote · Shadow twin
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-mute">
            Dual-ack
          </span>
          <span className="hidden rounded-full bg-promote-dim px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-promote sm:inline-flex">
            Cash open
          </span>
        </div>
      </div>

      <div className="border-b border-line px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-mute">
          <span>
            Live cash <span className="tabular text-ink">$48,220</span>
            <span className="text-faint"> · 3 legs waiting</span>
          </span>
          <span className="font-mono tabular text-faint">policy a7c2e91f</span>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-surface/80 px-3.5 py-2.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-promote/50 bg-promote/20 text-[10px] text-promote">
            ✓
          </span>
          <span className="text-[12px] leading-4 text-mute">
            <span className="font-medium text-ink">Policy seal</span>
            {" · "}promote rails confirmed for live submit
          </span>
        </div>
      </div>

      <div className="space-y-2.5 p-3.5 sm:p-5">
        {MOCK_LEGS.map((leg, i) => (
          <motion.div
            key={leg.symbol}
            className={`rounded-xl border bg-surface px-3.5 py-3.5 sm:px-4 ${
              leg.tone === "green" ? "border-[rgba(61,214,140,0.28)]" : "border-line"
            }`}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.52 + i * 0.07 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold tracking-[-0.015em] text-ink sm:text-[15px]">
                  <span className="uppercase text-mute">{leg.side}</span>{" "}
                  <span className="tabular">{leg.qty}</span> {leg.symbol}{" "}
                  <span className="text-mute">@ {leg.px}</span>
                </p>
                <p className="mt-1 text-[12px] leading-4 text-mute sm:text-[13px]">{leg.note}</p>
                <p className="mt-1.5 text-[11px] text-faint">
                  <span className="tabular">{leg.notional}</span> notional
                  {leg.tone === "green" ? " · green candidate" : ""}
                  {leg.state === "ready" ? " · ready" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                    leg.state === "ready" ? "bg-gain/15 text-gain" : "bg-gain/10 text-gain"
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

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-4 sm:px-6">
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
  const childDelay = 0.06;

  return (
    <MarketingShell>
      {/* HERO: type first, mock below */}
      <section className="landing-section mx-auto max-w-6xl px-5 pb-6 pt-16 sm:pt-24">
        <div className="max-w-3xl">
          <motion.div
            className="flex flex-wrap items-center gap-x-3 gap-y-2"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0 }}
          >
            <p className="label font-mono text-accent">Bitget AI Hackathon S2</p>
            <span className="hidden h-3 w-px bg-line2 sm:block" aria-hidden />
            <p className="label font-mono text-faint">tokenized US stocks · rToken</p>
          </motion.div>

          <div className="mt-6 border-t border-line pt-7 sm:mt-8 sm:pt-8">
            <h1 className="max-w-[14ch] text-[44px] font-semibold leading-[1.02] tracking-[-0.042em] text-ink sm:text-[60px] lg:text-[68px]">
              {HEADLINE.map((line, i) => (
                <StaggerLine
                  key={line}
                  text={line}
                  delay={0.08 + i * 0.11}
                  reduce={reduce}
                />
              ))}
            </h1>
          </div>

          <motion.p
            className="mt-7 max-w-xl text-[16px] leading-7 text-mute sm:text-[17px]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.3 }}
          >
            Your live Bitget book of rAAPL, rNVDA, rTSLA, rMSFT, and rAMZN stays untouched while
            agents trade a live-priced shadow twin. Morning: promote or discard each sized rToken
            leg.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap gap-3"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.36 }}
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

          <motion.p
            className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.44 }}
          >
            No promote means the night never hit your holdings
          </motion.p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl sm:mt-16 lg:mt-20">
          <PromoteMock reduce={reduce} />
        </div>
      </section>

      {/* PROBLEM */}
      <section className="landing-section mx-auto max-w-6xl px-5 py-24 sm:py-32">
        <div className="grid gap-10 border-t border-line pt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={softSpring}
          >
            <p className="label font-mono text-accent">The overnight gap</p>
            <h2 className="mt-5 max-w-sm text-[30px] font-semibold leading-[1.12] tracking-[-0.032em] text-ink sm:text-[36px]">
              Live books should sleep. Agents should not.
            </h2>
          </motion.div>
          <motion.div
            className="max-w-xl space-y-5 self-end text-[15px] leading-7 text-mute sm:text-[16px]"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ ...softSpring, delay: childDelay }}
          >
            <p>
              Overnight ideas on Bitget rTokens usually mean either sitting out or risking the live
              book. Both are wrong when agents can rehearse against a twin that tracks mid.
            </p>
            <p>
              SHADOWBOOK keeps cash and lots frozen on Bitget while the shadow twin absorbs every
              sized fill. At cash open you decide what becomes real.
            </p>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS: vertical numbered process */}
      <section className="landing-section mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <motion.div
          className="max-w-2xl"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={softSpring}
        >
          <p className="label font-mono text-accent">How it works</p>
          <h2 className="mt-5 text-[30px] font-semibold leading-[1.12] tracking-[-0.032em] text-ink sm:text-[36px]">
            Four steps from Bitget import to sealed promote.
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-mute">
            Every stage has a clear owner. Live orders only move when you promote.
          </p>
        </motion.div>

        <motion.ol
          className="process-rail mt-12 max-w-3xl overflow-hidden rounded-2xl border border-line bg-surface/40"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={softSpring}
        >
          {STEPS.map((step, i) => (
            <motion.li
              key={step.n}
              className={`relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 px-5 py-6 sm:gap-x-6 sm:px-7 sm:py-7 ${
                i < STEPS.length - 1 ? "border-b border-line" : ""
              }`}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ ...softSpring, delay: i * childDelay }}
            >
              <div className="relative flex flex-col items-center">
                <span className="process-node relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-accent/35 bg-accent-dim font-mono text-[11px] font-semibold tracking-wide text-accent">
                  {step.n}
                </span>
                {i < STEPS.length - 1 ? (
                  <span
                    className="process-connector absolute top-9 bottom-[-1.75rem] w-px bg-line2"
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-ink sm:text-[17px]">
                    {step.title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                    {step.owner}
                  </span>
                </div>
                <p className="mt-2 max-w-lg text-[13px] leading-5 text-mute sm:text-[14px] sm:leading-6">
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* PROOF */}
      <section className="landing-section mx-auto max-w-6xl px-5 py-24 sm:py-28">
        <motion.div
          className="overflow-hidden rounded-2xl border border-line bg-surface/50 px-5 py-10 sm:px-10 sm:py-12"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={softSpring}
        >
          <p className="label text-center font-mono text-accent">Built for Bitget rTokens</p>
          <div className="mt-10 grid gap-10 text-center sm:grid-cols-3 sm:gap-8">
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

      {/* FINAL CTA */}
      <section className="landing-section mx-auto max-w-6xl px-5 pb-32 pt-6 sm:pb-40">
        <motion.div
          className="mx-auto max-w-2xl border-t border-line pt-16 text-center"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={softSpring}
        >
          <p className="label font-mono text-promote">Ready at open</p>
          <h2 className="mt-5 text-[30px] font-semibold leading-[1.12] tracking-[-0.032em] text-ink sm:text-[38px]">
            Rehearse the night. Promote what earns the book.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-mute">
            One primary path: enter as operator, import your Bitget book, let the twin run, then
            promote at cash open.
          </p>
          <div className="mt-10 flex justify-center">
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
