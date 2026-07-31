import { useState, useEffect } from 'react'
import { Eye, EyeOff, ArrowLeft, Phone, Mail, Lock, User, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import Logo from '../components/Logo'
import { authApi } from '../services/api'

type Role = 'donor' | 'recipient' | 'volunteer' | 'admin'

interface AuthProps {
  role: Role
  onSuccess: () => void
  onBack: () => void
}

const roleConfig: Record<Role, { label: string; backendRole: string; color: string; bg: string }> = {
  donor: { label: 'Food Donor', backendRole: 'DONOR', color: 'bg-gradient-primary', bg: 'bg-emerald-50 text-emerald-800' },
  recipient: { label: 'Recipient Org', backendRole: 'NGO', color: 'bg-gradient-to-r from-blue-600 to-indigo-600', bg: 'bg-blue-50 text-blue-800' },
  volunteer: { label: 'Volunteer', backendRole: 'VOLUNTEER', color: 'bg-gradient-to-r from-purple-600 to-indigo-600', bg: 'bg-purple-50 text-purple-800' },
  admin: { label: 'Administrator', backendRole: 'ADMIN', color: 'bg-gradient-to-r from-rose-600 to-red-600', bg: 'bg-rose-50 text-rose-800' },
}

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', label: 'India (+91)' },
  { code: '+1', flag: '🇺🇸', label: 'USA (+1)' },
  { code: '+44', flag: '🇬🇧', label: 'UK (+44)' },
  { code: '+61', flag: '🇦🇺', label: 'Australia (+61)' },
  { code: '+971', flag: '🇦🇪', label: 'UAE (+971)' },
]

export default function Auth({ role, onSuccess, onBack }: AuthProps) {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone')
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot'>('login')
  const [showPass, setShowPass] = useState(false)

  // Phone OTP state
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNum, setPhoneNum] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(60)
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null)

  // Email state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('arjun@example.com')
  const [password, setPassword] = useState('password123')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request')

  // Status state
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const cfg = roleConfig[role]

  useEffect(() => {
    let timer: any
    if (mode === 'otp' && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((c) => (c > 0 ? c - 1 : 0))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [mode, cooldown])

  const fullPhoneNumber = `${countryCode}${phoneNum.trim()}`

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

  const handleGoogleAuth = async () => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const mockGoogleId = `google_id_${Date.now()}`
      const mockEmail = `user_${Date.now() % 10000}@gmail.com`

      await authApi.googleAuth({
        googleId: mockGoogleId,
        email: mockEmail,
        fullName: fullName || 'Google User',
        role: cfg.backendRole,
      })

      setSuccessMsg('Signed in with Google successfully!')
      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendPhoneOtp = async () => {
    if (!phoneNum.trim()) {
      setErrorMsg('Please enter your mobile number')
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await authApi.sendPhoneOtp(fullPhoneNumber)
      if (res.devOtpCode) {
        setDevOtpHint(res.devOtpCode)
      }
      setMode('otp')
      setCooldown(60)
      setSuccessMsg(`OTP sent to ${fullPhoneNumber}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPhoneOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP')
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await authApi.verifyPhoneOtp({
        phone: fullPhoneNumber,
        otpCode: code,
        fullName: fullName || undefined,
        role: cfg.backendRole,
      })
      setSuccessMsg('Mobile number verified successfully!')
      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required')
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          setErrorMsg('Full Name is required for registration')
          setLoading(false)
          return
        }
        await authApi.register({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phoneNum ? fullPhoneNumber : undefined,
          role: cfg.backendRole,
        })
        await authApi.login({ email: email.trim(), password })
      } else {
        await authApi.login({ email: email.trim(), password })
      }
      setSuccessMsg(mode === 'register' ? 'Account created successfully!' : 'Signed in successfully!')
      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your account email')
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await authApi.forgotPassword(email.trim())
      setSuccessMsg(res.message)
      if (res.devResetToken) {
        setDevOtpHint(res.devResetToken)
        setResetToken(res.devResetToken)
      }
      setForgotStep('reset')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetToken.trim() || !newPassword.trim()) {
      setErrorMsg('Reset code and new password are required')
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const res = await authApi.resetPassword(resetToken.trim(), newPassword)
      setSuccessMsg(res.message)
      setMode('login')
      setForgotStep('request')
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12 font-inter bg-gradient-hero">
      <div className="w-full max-w-md animate-scale-in">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-8 font-semibold cursor-pointer btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Auth Card */}
        <div className="bg-surface/90 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl p-8">
          {/* Logo & Role Badge */}
          <div className="flex items-center justify-between mb-6">
            <Logo size="sm" variant="full" />
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.bg}`}>
              {cfg.label}
            </span>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {devOtpHint && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-xl text-center">
              DEV TEST CODE: <span className="font-mono text-sm underline">{devOtpHint}</span>
            </div>
          )}

          {mode === 'otp' ? (
            <>
              <h2 className="text-2xl font-bold text-text-primary font-poppins mb-2">Verify Mobile OTP</h2>
              <p className="text-text-secondary text-sm mb-6">
                We sent a 6-digit verification code to <span className="font-semibold text-text-primary">{fullPhoneNumber}</span>
              </p>

              <div className="flex gap-2 mb-8">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="flex-1 h-13 text-center text-xl font-bold text-text-primary bg-bg rounded-xl border-2 border-border focus:border-primary focus:outline-none"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyPhoneOtp}
                disabled={loading}
                className={`w-full ${cfg.color} text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                Verify & Sign In
              </button>

              <div className="flex items-center justify-between mt-6 text-xs text-text-secondary">
                <span>Code expires in 5:00</span>
                <button
                  onClick={handleSendPhoneOtp}
                  disabled={cooldown > 0 || loading}
                  className="text-primary font-semibold hover:underline disabled:opacity-40"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          ) : mode === 'forgot' ? (
            <>
              <h2 className="text-2xl font-bold text-text-primary font-poppins mb-2">Forgot Password</h2>
              <p className="text-text-secondary text-sm mb-6">
                {forgotStep === 'request'
                  ? 'Enter your account email to receive a password reset verification token.'
                  : 'Enter the verification token and your new password.'}
              </p>

              {forgotStep === 'request' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="arjun@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className={`w-full ${cfg.color} text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2`}
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Send Reset Token
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      Reset Verification Code
                    </label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
                    />
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className={`w-full ${cfg.color} text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2`}
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Reset Password
                  </button>
                </div>
              )}

              <button
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-text-secondary mt-4 hover:underline"
              >
                Back to Sign In
              </button>
            </>
          ) : (
            <>
              {/* Main Auth Tabs */}
              <div className="flex bg-bg rounded-xl p-1 mb-6">
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    authMethod === 'phone' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  Mobile OTP
                </button>
                <button
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    authMethod === 'email' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  Email & Password
                </button>
              </div>

              {/* Sub-mode selector for Email */}
              {authMethod === 'email' && (
                <div className="flex justify-center gap-6 mb-6 text-xs font-semibold">
                  <button
                    onClick={() => setMode('login')}
                    className={mode === 'login' ? 'text-primary border-b-2 border-primary pb-1' : 'text-text-secondary'}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className={mode === 'register' ? 'text-primary border-b-2 border-primary pb-1' : 'text-text-secondary'}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Google Button */}
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-bg border border-border py-3 rounded-xl text-sm font-semibold text-text-primary hover:bg-border transition-all mb-6 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface px-3 text-xs text-text-secondary">or use {authMethod === 'phone' ? 'Mobile Number' : 'Email'}</span>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4">
                {(mode === 'register' || authMethod === 'phone') && (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Arjun Sharma"
                        className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary"
                      />
                    </div>
                  </div>
                )}

                {authMethod === 'phone' ? (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-3 bg-bg border border-border rounded-xl text-xs font-bold focus:outline-none focus:border-primary text-text-primary"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                          type="tel"
                          value={phoneNum}
                          onChange={(e) => setPhoneNum(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="arjun@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary placeholder-text-secondary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
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

                    {mode === 'login' && (
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={() => setMode('forgot')}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Submit button */}
              <button
                onClick={authMethod === 'phone' ? handleSendPhoneOtp : handleEmailAuth}
                disabled={loading}
                className={`w-full mt-6 ${cfg.color} text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {authMethod === 'phone' ? 'Send OTP Code' : mode === 'login' ? 'Sign In' : 'Create Account'}
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
