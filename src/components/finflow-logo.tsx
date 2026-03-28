interface FinflowLogoProps {
  size?: number
  className?: string
}

/** The cat-face icon mark only */
export function FinflowLogoMark({ size = 48, className = '' }: FinflowLogoProps) {
  const id = `fl-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Cat face: light tan at top → deep espresso at bottom */}
        <linearGradient id={`${id}-face`} x1="20" y1="5" x2="80" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#A78D78" />
          <stop offset="55%" stopColor="#6E473B" />
          <stop offset="100%" stopColor="#291C0E" />
        </linearGradient>
        {/* Income arrow: earthy olive */}
        <linearGradient id={`${id}-up`} x1="10" y1="70" x2="80" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#4A6A28" />
          <stop offset="100%" stopColor="#7AAA48" />
        </linearGradient>
        {/* Expense arrow: warm terracotta */}
        <linearGradient id={`${id}-dn`} x1="10" y1="25" x2="85" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%"  stopColor="#8B3A2A" />
          <stop offset="100%" stopColor="#D4624A" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d="M50 94 C34 94 18 87 13 77 C8 67 7 59 7 49 C7 37 11 28 16 25 L24 6 L32 24 C37 21 43 19 50 19 C57 19 63 21 68 24 L76 6 L84 25 C89 28 93 37 93 49 C93 59 92 67 87 77 C82 87 66 94 50 94 Z" />
        </clipPath>
      </defs>

      {/* Cat face silhouette */}
      <path
        d="M50 94 C34 94 18 87 13 77 C8 67 7 59 7 49 C7 37 11 28 16 25 L24 6 L32 24 C37 21 43 19 50 19 C57 19 63 21 68 24 L76 6 L84 25 C89 28 93 37 93 49 C93 59 92 67 87 77 C82 87 66 94 50 94 Z"
        fill={`url(#${id}-face)`}
      />

      {/* Arrows clipped to cat face */}
      <g clipPath={`url(#${id}-clip)`}>
        {/* Arrow UP (income) — bold arrow pointing top-right */}
        <polygon
          points="15,54 73,54 73,46 88,50 73,42 73,46 15,46"
          transform="rotate(-40, 50, 50)"
          fill={`url(#${id}-up)`}
        />
        {/* Arrow DOWN (expense) — bold arrow pointing bottom-right */}
        <polygon
          points="15,54 73,54 73,46 88,50 73,42 73,46 15,46"
          transform="rotate(40, 50, 50)"
          fill={`url(#${id}-dn)`}
        />
      </g>
    </svg>
  )
}

/** Full logo: icon mark + FINFLOW text + tagline */
export function FinflowLogoFull({ size = 32, className = '' }: FinflowLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FinflowLogoMark size={size} />
      <div className="flex flex-col leading-none">
        <span
          className="font-black tracking-tight text-brown-950 dark:text-brown-100"
          style={{ fontSize: size * 0.6, lineHeight: 1.1 }}
        >
          FINFLOW
        </span>
        <span
          className="text-brown-400 dark:text-brown-400 font-normal"
          style={{ fontSize: size * 0.26, lineHeight: 1.3 }}
        >
          Aliran Uang Pintar Anda
        </span>
      </div>
    </div>
  )
}

