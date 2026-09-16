"use client";

import { OperatorProvider } from "./operator-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <OperatorProvider>{children}</OperatorProvider>;
}
