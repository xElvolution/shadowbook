"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  const [policy, setPolicy] = useState<{
    autoThreshold: number;
    maxNotional: number;
    dualAckRequired: boolean;
  } | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setPolicy(d.settings?.policy ?? null))
      .catch(() => null);
  }, []);

  async function save() {
    if (!policy) return;
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy }),
    });
    const data = await res.json();
    setMsg(data.ok ? "Policy saved." : data.error || "Save failed");
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-mute">Promote policy and dual-ack rails.</p>
        {policy ? (
          <div className="mt-6 space-y-4 rounded-2xl border border-line bg-surface p-4">
            <label className="block text-sm">
              Auto threshold
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-xl border border-line bg-bge px-3 py-2"
                value={policy.autoThreshold}
                onChange={(e) =>
                  setPolicy({ ...policy, autoThreshold: Number(e.target.value) })
                }
              />
            </label>
            <label className="block text-sm">
              Max notional
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-line bg-bge px-3 py-2"
                value={policy.maxNotional}
                onChange={(e) =>
                  setPolicy({ ...policy, maxNotional: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={policy.dualAckRequired}
                onChange={(e) =>
                  setPolicy({ ...policy, dualAckRequired: e.target.checked })
                }
              />
              Dual-ack required
            </label>
            <button
              onClick={save}
              className="rounded-full bg-promote px-4 py-2 text-sm font-medium text-bg"
            >
              Save policy
            </button>
            {msg ? <p className="text-sm text-mute">{msg}</p> : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-mute">Loading...</p>
        )}
      </main>
    </AppShell>
  );
}
