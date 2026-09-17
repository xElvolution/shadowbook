import Link from "next/link";
import { Wordmark } from "./logo";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div className="ambient-moon -right-24 -top-24" />
      <div className="ambient-moon bottom-0 left-[-120px] opacity-60" />

      <header className="marketing-header relative z-20 border-b border-line/80 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="shrink-0">
              <Wordmark />
            </Link>
            <span className="bitget-chip hidden sm:inline-flex">Bitget · rToken</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="bitget-chip sm:hidden">Bitget</span>
            <Link href="/enter" className="btn-ghost !py-2 !text-[13px]">
              Enter
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="relative z-10 border-t border-line/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Wordmark />
            <span className="bitget-chip">Bitget AI Hackathon S2</span>
          </div>
          <p className="max-w-md text-[12px] leading-5 text-faint">
            Bitget AI Hackathon S2 · tokenized US stocks (rTokens) · Sole author XElvolution.
            Agents rehearse on a Bitget shadow twin. You promote at open.
          </p>
        </div>
      </footer>
    </div>
  );
}
