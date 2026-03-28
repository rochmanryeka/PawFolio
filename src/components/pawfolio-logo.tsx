import PawFolioPng from '/PawFolio.png'

interface PawFolioLogoProps {
  size?: number
  className?: string
}

/** The cat icon mark only — uses the PawFolio PNG */
export function PawFolioLogoMark({ size = 48, className = '' }: PawFolioLogoProps) {
  return (
    <img
      src={PawFolioPng}
      alt="PawFolio"
      width={size}
      height={size}
      className={`rounded-xl object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

/** Full logo: PNG mark + PawFolio text + tagline */
export function PawFolioLogoFull({ size = 32, className = '' }: PawFolioLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <PawFolioLogoMark size={size} />
      <div className="flex flex-col leading-none">
        <span
          className="font-black tracking-tight text-brown-950 dark:text-brown-100"
          style={{ fontSize: size * 0.6, lineHeight: 1.1 }}
        >
          PawFolio
        </span>
        <span
          className="text-brown-400 dark:text-brown-400 font-normal"
          style={{ fontSize: size * 0.26, lineHeight: 1.3 }}
        >
          Keuangan menyenangkan pribadimu
        </span>
      </div>
    </div>
  )
}
