interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 80, className = '' }: LogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle with Gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>

          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.7" />
          </linearGradient>

          {/* Soft Shadow */}
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Main Background */}
        <rect
          x="10"
          y="10"
          width="100"
          height="100"
          rx="28"
          fill="url(#bgGradient)"
          filter="url(#softShadow)"
        />

        {/* Calendar/Schedule Icon Elements */}
        {/* Top Bar */}
        <rect
          x="30"
          y="35"
          width="60"
          height="6"
          rx="3"
          fill="url(#accentGradient)"
        />

        {/* Calendar Grid - Stylized */}
        <g opacity="0.9">
          {/* Row 1 */}
          <rect x="35" y="50" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
          <rect x="48" y="50" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
          <rect x="61" y="50" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
          <rect x="74" y="50" width="8" height="8" rx="2" fill="white" opacity="0.6"/>

          {/* Row 2 */}
          <rect x="35" y="63" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
          <rect x="48" y="63" width="8" height="8" rx="2" fill="white" opacity="0.8"/>
          <rect x="61" y="63" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
          <rect x="74" y="63" width="8" height="8" rx="2" fill="white" opacity="0.8"/>

          {/* Row 3 - Highlighted Day */}
          <rect x="35" y="76" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
          <rect x="48" y="76" width="8" height="8" rx="2" fill="white" opacity="1"/>
          <rect x="61" y="76" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
          <rect x="74" y="76" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
        </g>

        {/* Checkmark for productivity */}
        <path
          d="M 42 92 L 50 98 L 68 82"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

// Simplified Logo for small sizes
export function LogoMini({ size = 40, className = '' }: LogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>

        <rect
          x="5"
          y="5"
          width="50"
          height="50"
          rx="14"
          fill="url(#miniGradient)"
        />

        <text
          x="30"
          y="38"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="28"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
        >
          D
        </text>
      </svg>
    </div>
  );
}
