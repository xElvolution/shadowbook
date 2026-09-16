export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <rect x="4" y="6" width="14" height="20" rx="2.5" fill="#1a1e2a" stroke="#c5b4ff" strokeWidth="1.4" />
      <rect x="14" y="6" width="14" height="20" rx="2.5" fill="#12151d" stroke="#9eb4ff" strokeWidth="1.4" opacity="0.92" />
      <path d="M18 12h6M18 16h5M18 20h4" stroke="#e8c56a" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={24} />
      <span className="text-[11px] font-semibold tracking-[0.18em] text-ink">SHADOWBOOK</span>
    </span>
  );
}
