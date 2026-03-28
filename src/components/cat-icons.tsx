interface CatIconProps {
  className?: string
  size?: number
}

export function CatFace({ className, size = 24 }: CatIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <path d="M12 8L8 28H20L12 8Z" fill="currentColor" opacity="0.8"/>
      <path d="M52 8L56 28H44L52 8Z" fill="currentColor" opacity="0.8"/>
      <path d="M14 12L11 26H19L14 12Z" fill="#FFB6C1"/>
      <path d="M50 12L53 26H45L50 12Z" fill="#FFB6C1"/>
      {/* Face */}
      <ellipse cx="32" cy="38" rx="22" ry="20" fill="currentColor"/>
      {/* Eyes */}
      <ellipse cx="24" cy="34" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="40" cy="34" rx="3.5" ry="4" fill="white"/>
      <ellipse cx="24.5" cy="35" rx="2" ry="2.5" fill="#1a1a2e"/>
      <ellipse cx="40.5" cy="35" rx="2" ry="2.5" fill="#1a1a2e"/>
      <circle cx="23" cy="33.5" r="1" fill="white"/>
      <circle cx="39" cy="33.5" r="1" fill="white"/>
      {/* Nose */}
      <ellipse cx="32" cy="41" rx="2" ry="1.5" fill="#FFB6C1"/>
      {/* Mouth */}
      <path d="M29 43Q32 46 35 43" stroke="#1a1a2e" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Whiskers */}
      <line x1="8" y1="38" x2="20" y2="39" stroke="#1a1a2e" strokeWidth="0.8" opacity="0.5"/>
      <line x1="8" y1="42" x2="20" y2="41" stroke="#1a1a2e" strokeWidth="0.8" opacity="0.5"/>
      <line x1="44" y1="39" x2="56" y2="38" stroke="#1a1a2e" strokeWidth="0.8" opacity="0.5"/>
      <line x1="44" y1="41" x2="56" y2="42" stroke="#1a1a2e" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  )
}

export function CatPaw({ className, size = 24 }: CatIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main pad */}
      <ellipse cx="32" cy="40" rx="12" ry="10" fill="currentColor"/>
      {/* Toe beans */}
      <ellipse cx="22" cy="28" rx="5" ry="6" fill="currentColor"/>
      <ellipse cx="32" cy="24" rx="5" ry="6" fill="currentColor"/>
      <ellipse cx="42" cy="28" rx="5" ry="6" fill="currentColor"/>
      {/* Inner pads */}
      <ellipse cx="32" cy="42" rx="7" ry="5" fill="#FFB6C1"/>
      <ellipse cx="22" cy="30" rx="3" ry="3.5" fill="#FFB6C1"/>
      <ellipse cx="32" cy="26" rx="3" ry="3.5" fill="#FFB6C1"/>
      <ellipse cx="42" cy="30" rx="3" ry="3.5" fill="#FFB6C1"/>
    </svg>
  )
}

export function CatSleep({ className, size = 24 }: CatIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sleeping cat body */}
      <ellipse cx="32" cy="44" rx="24" ry="12" fill="currentColor"/>
      {/* Head */}
      <circle cx="18" cy="36" r="10" fill="currentColor"/>
      {/* Ears */}
      <path d="M10 28L8 22L15 26Z" fill="currentColor"/>
      <path d="M22 26L24 20L17 24Z" fill="currentColor"/>
      <path d="M11 27L9.5 23L14 25.5Z" fill="#FFB6C1"/>
      <path d="M21 25.5L22.5 21.5L17.5 24Z" fill="#FFB6C1"/>
      {/* Closed eyes */}
      <path d="M13 36Q15 34 17 36" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M20 35Q22 33 24 35" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Tail */}
      <path d="M52 38Q58 30 54 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Zzz */}
      <text x="38" y="22" fontSize="10" fill="#a78bfa" fontWeight="bold">Z</text>
      <text x="44" y="16" fontSize="8" fill="#a78bfa" fontWeight="bold">z</text>
      <text x="49" y="12" fontSize="6" fill="#a78bfa" fontWeight="bold">z</text>
    </svg>
  )
}

export function CatHappy({ className, size = 24 }: CatIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <path d="M12 8L8 28H20L12 8Z" fill="currentColor" opacity="0.8"/>
      <path d="M52 8L56 28H44L52 8Z" fill="currentColor" opacity="0.8"/>
      <path d="M14 12L11 26H19L14 12Z" fill="#FFB6C1"/>
      <path d="M50 12L53 26H45L50 12Z" fill="#FFB6C1"/>
      {/* Face */}
      <ellipse cx="32" cy="38" rx="22" ry="20" fill="currentColor"/>
      {/* Happy eyes (curved) */}
      <path d="M20 33Q24 29 28 33" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M36 33Q40 29 44 33" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="18" cy="40" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.5"/>
      <ellipse cx="46" cy="40" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.5"/>
      {/* Nose */}
      <ellipse cx="32" cy="41" rx="2" ry="1.5" fill="#FFB6C1"/>
      {/* Smile */}
      <path d="M26 44Q32 50 38 44" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

export function CatMoney({ className, size = 24 }: CatIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <path d="M12 8L8 28H20L12 8Z" fill="#a78bfa" opacity="0.8"/>
      <path d="M52 8L56 28H44L52 8Z" fill="#a78bfa" opacity="0.8"/>
      <path d="M14 12L11 26H19L14 12Z" fill="#FFB6C1"/>
      <path d="M50 12L53 26H45L50 12Z" fill="#FFB6C1"/>
      {/* Face */}
      <ellipse cx="32" cy="38" rx="22" ry="20" fill="#a78bfa"/>
      {/* Star eyes */}
      <text x="19" y="38" fontSize="12" fill="#fbbf24">★</text>
      <text x="37" y="38" fontSize="12" fill="#fbbf24">★</text>
      {/* Nose */}
      <ellipse cx="32" cy="41" rx="2" ry="1.5" fill="#FFB6C1"/>
      {/* Open mouth */}
      <ellipse cx="32" cy="47" rx="4" ry="3" fill="#1a1a2e"/>
      <ellipse cx="32" cy="45.5" rx="3" ry="1.5" fill="white"/>
      {/* Coin */}
      <circle cx="52" cy="14" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="49" y="18" fontSize="10" fill="#92400e" fontWeight="bold">$</text>
    </svg>
  )
}

export function CatWave({ className, size = 64 }: CatIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="60" cy="90" rx="30" ry="20" fill="currentColor"/>
      {/* Head */}
      <circle cx="60" cy="55" r="25" fill="currentColor"/>
      {/* Ears */}
      <path d="M40 35L35 15L50 30Z" fill="currentColor"/>
      <path d="M80 35L85 15L70 30Z" fill="currentColor"/>
      <path d="M42 33L38 18L48 30Z" fill="#FFB6C1"/>
      <path d="M78 33L82 18L72 30Z" fill="#FFB6C1"/>
      {/* Eyes */}
      <ellipse cx="50" cy="52" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="70" cy="52" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="51" cy="53" rx="2.5" ry="3" fill="#1a1a2e"/>
      <ellipse cx="71" cy="53" rx="2.5" ry="3" fill="#1a1a2e"/>
      <circle cx="49.5" cy="51" r="1.2" fill="white"/>
      <circle cx="69.5" cy="51" r="1.2" fill="white"/>
      {/* Nose */}
      <ellipse cx="60" cy="60" rx="2.5" ry="2" fill="#FFB6C1"/>
      {/* Mouth */}
      <path d="M55 63Q60 67 65 63" stroke="#1a1a2e" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="42" cy="60" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.4"/>
      <ellipse cx="78" cy="60" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.4"/>
      {/* Waving paw */}
      <g className="animate-wave" style={{transformOrigin: '95px 55px'}}>
        <ellipse cx="95" cy="50" rx="8" ry="10" fill="currentColor" transform="rotate(-20, 95, 50)"/>
        <ellipse cx="95" cy="52" rx="4.5" ry="5" fill="#FFB6C1" transform="rotate(-20, 95, 52)"/>
      </g>
      {/* Other paw */}
      <ellipse cx="40" cy="95" rx="8" ry="6" fill="currentColor"/>
      <ellipse cx="40" cy="96" rx="4.5" ry="3" fill="#FFB6C1"/>
      {/* Tail */}
      <path d="M88 95Q100 80 95 65" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
