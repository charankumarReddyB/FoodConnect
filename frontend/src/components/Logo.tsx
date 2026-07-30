interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon' | 'monochrome' | 'dark' | 'light'
  className?: string
}

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', container: 'w-8 h-8 rounded-lg', text: 'text-base' },
    md: { icon: 'w-7 h-7', container: 'w-10 h-10 rounded-xl', text: 'text-xl' },
    lg: { icon: 'w-9 h-9', container: 'w-14 h-14 rounded-2xl', text: 'text-2xl' },
    xl: { icon: 'w-12 h-12', container: 'w-20 h-20 rounded-3xl', text: 'text-4xl' },
  }

  const dim = sizeMap[size]

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Mark */}
      <div className={`relative ${dim.container} bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-primary/30 rounded-xl filter blur-md animate-pulse-glow" />
        
        {/* SVG Logo - Merged Heart & Food Bowl Symbol */}
        <svg
          className={`${dim.icon} text-white relative z-10`}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Steam curves */}
          <path
            d="M11 7C11 5.5 12 5 12 4M16 6C16 4.5 17 4 17 3M21 7C21 5.5 22 5 22 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Bowl contour merged with heart base */}
          <path
            d="M6 14C6 14 7.5 23 16 26C24.5 23 26 14 26 14H6Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Heart Arc Top */}
          <path
            d="M16 14C14-0.5 6 3 6 10.5C6 14 7.5 18 16 23.5C24.5 18 26 14 26 10.5C26 3 18-0.5 16 14Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className={`font-poppins font-extrabold tracking-tight ${dim.text} leading-none flex items-center`}>
            <span className={variant === 'dark' ? 'text-white' : 'text-slate-900'}>Food</span>
            <span className="text-emerald-600">Connect</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-1 animate-pulse" />
          </div>
          {size === 'lg' || size === 'xl' ? (
            <span className="text-xs font-semibold text-slate-600 tracking-wider uppercase mt-1">
              Zero Waste · India
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
