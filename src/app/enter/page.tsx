"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarketingShell } from "@/components/marketing-shell";
import { useOperator } from "@/components/operator-context";

export default function EnterPage() {
  const router = useRouter();
  const { refresh } = useOperator();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/enter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, handle }),
    });
    const data = await res.json();
    setBusy(false);
    if (!data.ok) {
      setError(data.error || "Could not enter");
      return;
    }
    await refresh();
    router.push(data.onboarded ? "/home" : "/onboarding");
  }

  return (
    <MarketingShell>
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold">Enter</h1>
        <p className="text-sm text-mute">Sign in as an operator to open the shadow desk.</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <input
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm"
            placeholder="Handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-loss">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-promote px-4 py-2 text-sm font-medium text-bg disabled:opacity-60"
          >
            {busy ? "Entering..." : "Continue"}
          </button>
        </form>
      </main>
    </MarketingShell>
  );
}
