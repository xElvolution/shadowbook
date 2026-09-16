"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Operator } from "@/lib/types";

type Ctx = {
  operator: Operator | null;
  onboarded: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const OperatorCtx = createContext<Ctx | null>(null);

export function OperatorProvider({ children }: { children: React.ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.ok && data.operator) {
        setOperator(data.operator);
        setOnboarded(!!data.onboarded);
      } else {
        setOperator(null);
        setOnboarded(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setOperator(null);
    setOnboarded(false);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ operator, onboarded, loading, refresh, signOut }),
    [operator, onboarded, loading, refresh, signOut],
  );

  return <OperatorCtx.Provider value={value}>{children}</OperatorCtx.Provider>;
}

export function useOperator() {
  const ctx = useContext(OperatorCtx);
  if (!ctx) throw new Error("useOperator outside provider");
  return ctx;
}
