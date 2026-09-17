import Link from "next/link";
import { Wordmark } from "./logo";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="ambient-moon -right-24 -top-24" />
      <div className="ambient-moon bottom-0 left-[-120px] opacity-60" />
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/">
          <Wordmark />
        </Link>
        <Link href="/enter" className="btn-ghost !py-2 !text-[13px]">
          Enter
        </Link>
      </header>
      <div className="relative z-10">{children}</div>
      <footer className="relative z-10 mx-auto max-w-5xl px-5 py-10 text-[12px] text-faint">
        Bitget AI Hackathon S2 · tokenized US stocks (rTokens) · Sole author XElvolution.
        Not Solana. Not Stocklana. Agents rehearse on a Bitget shadow twin. You promote at open.
      </footer>
    </div>
  );
}
