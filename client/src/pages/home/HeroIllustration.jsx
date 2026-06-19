// Self-contained SVG mockup of the app dashboard — no external assets needed.
const HeroIllustration = () => (
  <svg
    className="hero-illustration"
    viewBox="0 0 520 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="ApplyWise dashboard preview"
  >
    <defs>
      <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1a73e8" />
        <stop offset="1" stopColor="#4285f4" />
      </linearGradient>
      <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#1a73e8" stopOpacity="0.35" />
        <stop offset="1" stopColor="#1a73e8" />
      </linearGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="14" stdDeviation="22" floodColor="#1a73e8" floodOpacity="0.15" />
      </filter>
    </defs>

    {/* Window */}
    <g filter="url(#soft)">
      <rect x="20" y="24" width="480" height="372" rx="18" fill="#ffffff" stroke="#dadce0" />
      {/* Title bar */}
      <rect x="20" y="24" width="480" height="46" rx="18" fill="#f1f3f4" />
      <rect x="20" y="52" width="480" height="18" fill="#f1f3f4" />
      <rect x="20" y="69" width="480" height="1" fill="#dadce0" />
      <circle cx="44" cy="47" r="5" fill="#ea4335" />
      <circle cx="62" cy="47" r="5" fill="#fbbc04" />
      <circle cx="80" cy="47" r="5" fill="#34a853" />
      <rect x="210" y="41" width="100" height="12" rx="6" fill="#e8eaed" />
    </g>

    {/* Stat cards */}
    <g>
      <rect x="40" y="90" width="135" height="74" rx="12" fill="#f8f9fa" stroke="#dadce0" />
      <rect x="56" y="106" width="40" height="10" rx="5" fill="#e8eaed" />
      <rect x="56" y="126" width="64" height="20" rx="6" fill="url(#cardGrad)" />

      <rect x="192" y="90" width="135" height="74" rx="12" fill="#f8f9fa" stroke="#dadce0" />
      <rect x="208" y="106" width="40" height="10" rx="5" fill="#e8eaed" />
      <rect x="208" y="126" width="50" height="20" rx="6" fill="#e8f0fe" />

      <rect x="344" y="90" width="135" height="74" rx="12" fill="#f8f9fa" stroke="#dadce0" />
      <rect x="360" y="106" width="40" height="10" rx="5" fill="#e8eaed" />
      <rect x="360" y="126" width="56" height="20" rx="6" fill="#e6f4ea" />
    </g>

    {/* Chart card */}
    <g>
      <rect x="40" y="180" width="280" height="196" rx="12" fill="#ffffff" stroke="#dadce0" />
      <rect x="58" y="198" width="90" height="12" rx="6" fill="#e8eaed" />
      {/* Bars */}
      <rect x="64" y="320" width="28" height="36" rx="5" fill="url(#barGrad)" />
      <rect x="110" y="288" width="28" height="68" rx="5" fill="url(#barGrad)" />
      <rect x="156" y="256" width="28" height="100" rx="5" fill="url(#barGrad)" />
      <rect x="202" y="300" width="28" height="56" rx="5" fill="url(#barGrad)" />
      <rect x="248" y="270" width="28" height="86" rx="5" fill="url(#barGrad)" />
    </g>

    {/* Application list card */}
    <g>
      <rect x="336" y="180" width="144" height="196" rx="12" fill="#ffffff" stroke="#dadce0" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(0, ${i * 44})`}>
          <circle cx="362" cy="212" r="11" fill="url(#cardGrad)" />
          <rect x="382" y="200" width="78" height="9" rx="4.5" fill="#e8eaed" />
          <rect x="382" y="216" width="50" height="8" rx="4" fill="#f1f3f4" />
        </g>
      ))}
    </g>
  </svg>
);

export default HeroIllustration;
