import type { ReactNode } from 'react'

export interface PhoneFrameProps {
  children: ReactNode
  className?: string
  theme?: 'dark' | 'light'
  time?: string
  width?: number | string
  height?: number | string
}

export default function PhoneFrame({
  children,
  className = '',
  theme = 'dark',
  time = '9:41',
  width = 265,
  height = 540,
}: PhoneFrameProps) {
  const isDark = theme === 'dark'
  const textColor = isDark ? 'text-cream' : 'text-ink'
  const iconFill = isDark ? '#F4F0E9' : '#1E1E1E'
  const indicatorColor = isDark ? 'bg-cream/40' : 'bg-ink/30'

  return (
    <div
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      className={`relative select-none shrink-0 transition-transform duration-300 ${className}`}
    >
      {/* Hardware Chassis: Titanium Bezel */}
      <div className="absolute inset-0 rounded-[44px] bg-[#18181A] p-[9px] shadow-[0_28px_65px_-12px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.09)] ring-1 ring-black/80">
        {/* Subtle Specular Bezel Inset Highlight */}
        <div className="absolute inset-[1px] rounded-[43px] border border-white/10 pointer-events-none" />

        {/* Left Side Volume Up & Down Buttons */}
        <div className="absolute -left-[3px] top-24 w-[3px] h-9 bg-neutral-600 rounded-l-xs shadow-xs" />
        <div className="absolute -left-[3px] top-36 w-[3px] h-9 bg-neutral-600 rounded-l-xs shadow-xs" />

        {/* Right Side Power Button */}
        <div className="absolute -right-[3px] top-28 w-[3px] h-13 bg-neutral-600 rounded-r-xs shadow-xs" />

        {/* Inner Screen Glass Area */}
        <div className="relative w-full h-full rounded-[35px] overflow-hidden flex flex-col bg-black">
          {/* Top Status Bar & Dynamic Island */}
          <div className="relative w-full pt-2.5 px-6 flex items-center justify-between z-40 shrink-0">
            {/* Clock Time */}
            <span className={`text-[11px] font-semibold tracking-tight ${textColor}`}>
              {time}
            </span>

            {/* Dynamic Island / Camera Cutout */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[76px] h-[19px] bg-black rounded-full flex items-center justify-end pr-2.5 gap-1.5 shadow-inner">
              {/* Camera Lens with reflection */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#0D121D] ring-1 ring-neutral-800 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#183252]/80" />
              </div>
            </div>

            {/* Status Icons: Cellular, Wi-Fi, Battery */}
            <div className="flex items-center gap-1.5" style={{ color: iconFill }}>
              {/* Cellular Signal (4 bars) */}
              <svg width="13" height="10" viewBox="0 0 17 12" fill={iconFill}>
                <rect x="0" y="9" width="3" height="3" rx="0.5" />
                <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
                <rect x="9" y="3" width="3" height="9" rx="0.5" />
                <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
              </svg>

              {/* Wi-Fi Icon */}
              <svg width="13" height="10" viewBox="0 0 16 12" fill={iconFill}>
                <path d="M8 9.5C8.82843 9.5 9.5 8.82843 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.82843 7.17157 9.5 8 9.5Z" />
                <path d="M4.5 5C5.5 4 6.8 3.5 8 3.5C9.2 3.5 10.5 4 11.5 5" stroke={iconFill} strokeWidth="1.4" strokeLinecap="round" fill="none" />
                <path d="M1.5 2C3.3 0.6 5.6 0 8 0C10.4 0 12.7 0.6 14.5 2" stroke={iconFill} strokeWidth="1.4" strokeLinecap="round" fill="none" />
              </svg>

              {/* Battery Capsule */}
              <div className="flex items-center gap-0.5">
                <div className="w-[18px] h-[9px] rounded-[3px] border border-current p-[1px] flex items-center">
                  <div className="w-full h-full bg-current rounded-xs" />
                </div>
                <div className="w-[1px] h-[3px] bg-current rounded-r-xs" />
              </div>
            </div>
          </div>

          {/* Screen Content Body */}
          <div className="relative w-full flex-1 overflow-hidden flex flex-col">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="w-full pb-1 pt-1 flex justify-center z-40 shrink-0">
            <div className={`w-28 h-1 ${indicatorColor} rounded-full`} />
          </div>
        </div>
      </div>
    </div>
  )
}
