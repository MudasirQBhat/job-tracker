// ApplyWise brand lockup: gradient mark + two-tone wordmark. Self-contained SVG.
const Logo = ({ size = 34, withText = true }) => (
  <span className="logo-lockup" aria-label="ApplyWise">
    <span className="logo-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="awGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1a73e8" />
            <stop offset="1" stopColor="#4285f4" />
          </linearGradient>
          <linearGradient id="awShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#awGrad)" />
        <rect width="36" height="36" rx="10" fill="url(#awShine)" />
        {/* upward check — "applied, wisely" */}
        <path d="M9.5 18.8 L14.2 23.5 L24.5 12.2" stroke="#ffffff" strokeWidth="2.8"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* sparkle — "wise" */}
        <path d="M28 5.6 C28.3 7.3 28.8 7.8 30.4 8.1 C28.8 8.4 28.3 8.9 28 10.6 C27.7 8.9 27.2 8.4 25.6 8.1 C27.2 7.8 27.7 7.3 28 5.6 Z"
          fill="#ffffff" />
      </svg>
    </span>
    {withText && (
      <span className="logo-word">
        <span className="logo-word-1">Apply</span><span className="logo-word-2">Wise</span>
      </span>
    )}
  </span>
);

export default Logo;
