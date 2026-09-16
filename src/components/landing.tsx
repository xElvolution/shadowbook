"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MarketingShell } from "./marketing-shell";

export function Landing() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-3xl flex-col items-start px-5 pb-24 pt-16 sm:pt-24">
        <motion.p
          className="label text-accent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Bitget rToken overnight
        </motion.p>
        <motion.h1
          className="mt-4 max-w-2xl text-[40px] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[52px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Agents rehearse overnight. You promote at open.
        </motion.h1>
        <motion.p
          className="mt-5 max-w-xl text-[16px] leading-7 text-mute"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          Your live Bitget book stays untouched while agents trade a live-priced shadow twin.
          Morning: accept or discard each sized rToken leg. No promote means the night never hit
          your holdings.
        </motion.p>
        <motion.div
          className="mt-9 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <Link href="/enter" className="btn-primary">
            Open Shadowbook
          </Link>
          <Link href="/enter?next=/onboarding" className="btn-ghost">
            Import Bitget book
          </Link>
        </motion.div>

        <motion.div
          className="mt-16 grid w-full gap-3 sm:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
        >
          {[
            { t: "Shadow twin", d: "Same lots. Live mid. Zero live orders overnight." },
            { t: "Line-item promote", d: "Take the good legs. Burn the rest. Dual-ack." },
            { t: "Sealed receipts", d: "Hash chain for every fill, promote, and reject." },
          ].map((c) => (
            <div key={c.t} className="card card-glow p-5">
              <div className="text-[13px] font-semibold text-accent">{c.t}</div>
              <p className="mt-2 text-[13px] leading-5 text-mute">{c.d}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </MarketingShell>
  );
}
