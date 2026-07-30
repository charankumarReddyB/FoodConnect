import { useState } from 'react'
import { Heart, Eye, EyeOff, ArrowLeft, Phone, Mail, Lock, User } from 'lucide-react'
import Logo from '../components/Logo'

type Role = 'donor' | 'recipient' | 'volunteer' | 'admin'

interface AuthProps {
  role: Role
  onSuccess: () => void
  onBack: () => void
}

const roleConfig: Record<Role, { label: string; color: string; bg: string }> = {
  donor: { label: 'Food Donor', color: 'bg-gradient-primary', bg: 'bg-emerald-50 text-emerald-800' },
  recipient: { label: 'Recipient Org', color: 'bg-gradient-to-r from-blue-600 to-indigo-600', bg: 'bg-blue-50 text-blue-800' },
  volunteer: { label: 'Volunteer', color: 'bg-gradient-to-r from-purple-600 to-indigo-600', bg: 'bg-purple-50 text-purple-800' },
  admin: { label: 'Administrator', color: 'bg-gradient-to-r from-rose-600 to-red-600', bg: 'bg-rose-50 text-rose-800' },
}

export default function Auth({ role, onSuccess, onBack }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login')
  const [showPass, setShowPass] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const cfg = roleConfig[role]

  const handleOtpChange = (i: number, val: string) => {
    if (val.length > 1) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`)
      el?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12 font-inter bg-gradient-hero">
      <div className="w-full max-w-md animate-scale-in">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 font-semibold cursor-pointer btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Card */}
        <div className="bg-surface/90 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl p-8">
          {/* Logo + role badge */}
          <div className="flex items-center justify-between mb-8">
            <Logo size="sm" variant="full" />
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.bg}`}>
              {cfg.label}
            </span>
          </div>

          {mode === 'otp' ? (
            <>
              <h2 className="text-2xl font-bold text-text-primary font-poppins mb-2">Verify OTP</h2>
              <p className="text-text-secondary text-sm mb-8">
                We sent a 6-digit code to <span className="font-semibold text-text-primary">+91 98765 43210</span>
              </p>
              <div className="flex gap-3 mb-8">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="flex-1 h-14 text-center text-xl font-bold text-text-primary bg-bg rounded-xl border-2 border-border focus:border-primary focus:outline-none"
                  />
                ))}
              </div>
              <button
                onClick={onSuccess}
                className={`w-full ${cfg.color} text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg`}
              >
                Verify & Continue
              </button>
              <button className="w-full text-center text-sm text-primary font-medium mt-4 hover:underline">
                Resend OTP in 0:45
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-text-primary font-poppins mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-text-secondary text-sm mb-8">
                {mode === 'login' ? 'Sign in to your FoodConnect account' : 'Join the FoodConnect community'}
              </p>

              {/* Tab */}
              <div className="flex bg-bg rounded-xl p-1 mb-6">
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      mode === m ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input
                        type="text"
                        placeholder="Arjun Sharma"
                        className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                    {mode === 'login' ? 'Email or Phone' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="email"
                      placeholder="arjun@example.com"
                      defaultValue="arjun@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary"
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      defaultValue="password123"
                      className="w-full pl-10 pr-11 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex justify-end mt-2">
                  <button className="text-xs text-primary font-medium hover:underline">Forgot password?</button>
                </div>
              )}

              <button
                onClick={() => mode === 'register' ? setMode('otp') : onSuccess()}
                className={`w-full mt-6 ${cfg.color} text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg`}
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface px-3 text-xs text-text-secondary">or continue with</span>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-3 bg-bg border border-border py-3 rounded-xl text-sm font-medium text-text-primary hover:bg-border">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-text-secondary mt-6">
          By signing in, you agree to our{' '}
          <span className="text-primary font-medium cursor-pointer hover:underline">Terms</span> and{' '}
          <span className="text-primary font-medium cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
