import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2, MapPin, AlertCircle, X } from 'lucide-react'
import { checkInApi, CheckInStatusResponse } from '../services/api'

interface CheckInButtonProps {
  eventId?: string
  location?: string
  variant?: 'header' | 'card' | 'full'
  className?: string
  onStatusChange?: (status: CheckInStatusResponse) => void
}

export default function CheckInButton({
  eventId = 'EVT-DAILY-CHECKIN',
  location = 'FoodConnect Hub',
  variant = 'full',
  className = '',
  onStatusChange,
}: CheckInButtonProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null)

  // TASK 2 — Requirement 3: On page load, check current status via GET endpoint
  useEffect(() => {
    let isMounted = true

    async function loadCheckInStatus() {
      try {
        setIsLoading(true)
        const statusRes = await checkInApi.getStatus()
        if (isMounted) {
          setIsCheckedIn(statusRes.checkedIn)
          if (statusRes.checkedInAt) {
            setCheckedInAt(statusRes.checkedInAt)
          }
          if (onStatusChange) {
            onStatusChange(statusRes)
          }
        }
      } catch (err: any) {
        console.error('Failed to load check-in status:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCheckInStatus()

    return () => {
      isMounted = false
    }
  }, [onStatusChange])

  // TASK 2 — Requirement 1 & 2: On click, call API with loading state, success/failure handling
  const handleCheckIn = async () => {
    if (isCheckedIn || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await checkInApi.checkIn({
        eventId,
        location,
        notes: 'User self check-in via dashboard button',
      })

      setIsCheckedIn(true)
      setCheckedInAt(response.checkedInAt)
      if (onStatusChange) {
        onStatusChange({
          checkedIn: true,
          checkInId: response.id,
          checkedInAt: response.checkedInAt,
          message: 'Checked in successfully',
        })
      }
    } catch (err: any) {
      const msg = err.message || 'Check-in failed. Please check your network and try again.'
      setErrorMessage(msg)

      // If user was already checked in, reflect it in the UI state
      if (err.status === 409 || msg.toLowerCase().includes('already checked in')) {
        setIsCheckedIn(true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return ''
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  // Header compact button variant
  if (variant === 'header') {
    return (
      <div className="relative inline-flex items-center">
        {errorMessage && (
          <div className="absolute top-12 right-0 z-50 bg-error text-white text-xs px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 max-w-xs animate-in fade-in slide-in-from-top-1 font-inter">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-auto opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isLoading ? (
          <button
            disabled
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bg border border-border text-xs text-text-secondary font-medium"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Checking...</span>
          </button>
        ) : isCheckedIn ? (
          <button
            disabled
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold shadow-sm cursor-default"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Checked In ✅ {formatTime(checkedInAt) && `(${formatTime(checkedInAt)})`}</span>
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={isSubmitting}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-600 active:scale-95 transition-all shadow-sm disabled:opacity-50 ${className}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking In...</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5" />
                <span>Check In</span>
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  // Card / Full standalone button variant
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toast Notification Error Banner */}
      {errorMessage && (
        <div className="bg-error/10 border border-error/30 text-error text-xs p-3 rounded-xl flex items-center justify-between gap-2 font-inter shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-error/20 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isLoading ? (
        <button
          disabled
          className="w-full py-3.5 px-5 rounded-2xl bg-bg border border-border text-text-secondary font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Verifying check-in status...</span>
        </button>
      ) : isCheckedIn ? (
        <div className="bg-success/10 border border-success/30 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-success font-bold text-base font-poppins">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span>Checked In ✅</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Checked in today at {formatTime(checkedInAt) || 'active session'}. Thank you for being active!
          </p>
        </div>
      ) : (
        <button
          onClick={handleCheckIn}
          disabled={isSubmitting}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 font-inter cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Recording Check-in...</span>
            </>
          ) : (
            <>
              <MapPin className="w-4.5 h-4.5" />
              <span>Check In Now</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
