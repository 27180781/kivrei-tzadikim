export default function Candle({ className = "w-10 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 60" className={className} style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="wax" x1="0" x2="1">
          <stop offset="0" stopColor="#efe2c4" />
          <stop offset="0.5" stopColor="#fff8e8" />
          <stop offset="1" stopColor="#e2d1ab" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ffcf70" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb040" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fl" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset="0.45" stopColor="#ffd36b" />
          <stop offset="1" stopColor="#ff9a2e" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="16" r="18" fill="url(#glow)" />
      <g className="flame">
        <path d="M20 3c-4 7-7 10.5-7 15.5a7 7 0 0 0 14 0C27 13.5 24 10 20 3z" fill="url(#fl)" />
      </g>
      <rect x="19.3" y="22" width="1.4" height="5" rx="0.7" fill="#3a2a14" />
      <rect x="12" y="26" width="16" height="30" rx="3" fill="url(#wax)" />
      <rect x="8" y="55" width="24" height="4" rx="2" fill="#b88a3e" />
    </svg>
  );
}
