import { useEffect, useState } from 'react'
import Logo from './Logo'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setFade(true)
          setTimeout(onComplete, 400)
          return 100
        }
        return prev + 20
      })
    }, 180)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center px-6 transition-opacity duration-500 bg-gradient-hero ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Decorative Rings */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-emerald-500/10 animate-pulse-glow" />
      <div className="absolute w-[320px] h-[320px] rounded-full border border-amber-500/10 animate-float" />

      {/* Main Logo & Tagline */}
      <div className="relative z-10 flex flex-col items-center text-center animate-scale-in">
        <Logo size="xl" variant="full" className="mb-6" />
        
        <p className="text-slate-300 text-sm max-w-xs font-medium mt-2 leading-relaxed tracking-wide">
          Connecting Surplus Food with Communities Across India 🇮🇳
        </p>

        {/* Loading Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-10 overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <span className="text-slate-600 text-xs font-mono mt-3 uppercase tracking-widest">
          {progress < 100 ? 'Initializing Engine...' : 'Ready'}
        </span>
      </div>
    </div>
  )
}
