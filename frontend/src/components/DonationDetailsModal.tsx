import React, { useState, useEffect } from 'react'
import { X, MapPin, Clock, Users, Package, CheckCircle, TrendingUp, AlertCircle, Truck, Building, Send, Loader2 } from 'lucide-react'
import { DonationItem, UserProfile, requestApi } from '../services/api'
import { firestore } from '../config/firebase'
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore'
import { notifyPartiesOnAction } from '../services/notificationService'

interface DonationDetailsModalProps {
  donation: DonationItem | null
  onClose: () => void
  onClaim?: (donation: DonationItem) => void
  userRole?: string
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  DELIVERED: { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  IN_TRANSIT: { label: 'In Transit', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', icon: TrendingUp },
  PICKED_UP: { label: 'Picked Up', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', icon: TrendingUp },
  ACCEPTED: { label: 'Accepted', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', icon: CheckCircle },
  REQUESTED: { label: 'Requested', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', icon: Clock },
  AVAILABLE: { label: 'Available', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', icon: Clock },
  CREATED: { label: 'Available', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', icon: Clock },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700', icon: AlertCircle },
  EXPIRED: { label: 'Expired', bg: 'bg-gray-50 text-gray-700 border-gray-200', text: 'text-gray-700', icon: Clock },
}

export default function DonationDetailsModal({ donation, onClose, onClaim, userRole }: DonationDetailsModalProps) {
  if (!donation) return null

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem('foodconnect_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [requestedServings, setRequestedServings] = useState<number>(donation.estimatedServings || 10)
  const [requestNotes, setRequestNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [existingRequest, setExistingRequest] = useState<any | null>(null)
  const [checkingExisting, setCheckingExisting] = useState<boolean>(true)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null)

  const isRecipientUser =
    userRole === 'recipient' ||
    ['NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'SHELTER', 'RECIPIENT'].includes(currentUser?.role || '')

  // Reset error/success state on modal open / donation switch
  useEffect(() => {
    setActionErrorMsg(null)
    setActionSuccessMsg(null)
  }, [donation?.id])

  // Check if current recipient already submitted a request for this donation
  useEffect(() => {
    let isMounted = true
    const checkUserRequest = async () => {
      if (!currentUser?.id || !donation?.id || !isRecipientUser) {
        if (isMounted) setCheckingExisting(false)
        return
      }

      // Check local cache first
      try {
        const localRaw = localStorage.getItem('foodconnect_local_requests')
        if (localRaw) {
          const list = JSON.parse(localRaw)
          const found = list.find(
            (r: any) => r.donationId === donation.id && (r.recipientId === currentUser.id || !r.recipientId)
          )
          if (found && isMounted) {
            setExistingRequest(found)
            setCheckingExisting(false)
            return
          }
        }
      } catch (_) {}

      try {
        // Query Firestore 'requests' collection
        const q1 = query(
          collection(firestore, 'requests'),
          where('donationId', '==', donation.id),
          where('recipientId', '==', currentUser.id)
        )
        const snap1 = await getDocs(q1)
        if (!snap1.empty && isMounted) {
          setExistingRequest(snap1.docs[0].data())
          setCheckingExisting(false)
          return
        }

        // Also check 'donation_requests' for backend sync compatibility
        const q2 = query(
          collection(firestore, 'donation_requests'),
          where('donationId', '==', donation.id),
          where('recipientId', '==', currentUser.id)
        )
        const snap2 = await getDocs(q2)
        if (!snap2.empty && isMounted) {
          setExistingRequest(snap2.docs[0].data())
        }
      } catch (err) {
        console.warn('Could not check existing donation requests:', err)
      } finally {
        if (isMounted) setCheckingExisting(false)
      }
    }

    checkUserRequest()
    return () => {
      isMounted = false
    }
  }, [donation?.id, currentUser?.id, isRecipientUser])

  const handleRequestFood = async () => {
    if (!currentUser?.id) {
      setActionErrorMsg('Please log in as a recipient to request food.')
      return
    }

    // 1. Validate donation availability
    if (donation.status !== 'AVAILABLE' && donation.status !== 'CREATED') {
      setActionErrorMsg(`This donation is no longer available. Status: ${donation.status}`)
      return
    }

    // 2. Validate no duplicate request
    if (existingRequest && existingRequest.status !== 'REJECTED') {
      setActionErrorMsg('You have already submitted a request for this food donation.')
      return
    }

    setIsSubmitting(true)
    setActionErrorMsg(null)

    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const nowIso = new Date().toISOString()

      const requestData = {
        id: requestId,
        donationId: donation.id,
        donorId: donation.donorId || '',
        donorName: donation.donorName || 'Food Donor',
        recipientId: currentUser.id,
        recipientName: currentUser.fullName || 'Recipient Organization',
        recipientPhone: currentUser.phone || '',
        foodTitle: donation.title,
        quantityDescription: donation.quantityDescription,
        requestedServings: requestedServings || donation.estimatedServings || 10,
        notes: requestNotes.trim() || 'Food request for meal distribution',
        status: 'PENDING',
        pickupAddress: donation.pickupAddress,
        deliveryMethod: donation.deliveryMethod,
        createdAt: nowIso,
        requestTime: nowIso,
        requestedAt: nowIso,
      }

      // 1. Immediate local storage persistence cache
      try {
        const localRaw = localStorage.getItem('foodconnect_local_requests')
        const localList = localRaw ? JSON.parse(localRaw) : []
        localStorage.setItem('foodconnect_local_requests', JSON.stringify([requestData, ...localList]))
      } catch (_) {}

      // 2. Save request record to Firestore 'donation_requests' & 'requests'
      try {
        await setDoc(doc(firestore, 'donation_requests', requestId), requestData)
      } catch (err) {
        console.warn('Firestore donation_requests write notice:', err)
      }

      try {
        await setDoc(doc(firestore, 'requests', requestId), requestData)
      } catch (err) {
        console.warn('Firestore requests write notice:', err)
      }

      // 3. Update donation status in Firestore to 'REQUESTED'
      try {
        const donationRef = doc(firestore, 'donations', donation.id)
        await updateDoc(donationRef, {
          status: 'REQUESTED',
          updatedAt: nowIso,
        })
      } catch (err) {
        console.warn('Could not update donation status in Firestore:', err)
      }

      // 4. Asynchronously call Spring Boot REST API
      try {
        await requestApi.requestDonation(donation.id, requestedServings, requestNotes)
      } catch (err) {
        console.log('Spring Boot request call status notice:', err)
      }

      // 5. Send real-time notification to the donor
      try {
        await notifyPartiesOnAction({
          action: 'REQUESTED',
          foodTitle: donation.title,
          donorName: donation.donorName,
          donorId: donation.donorId,
          recipientName: currentUser.fullName || 'Recipient Organization',
          recipientId: currentUser.id,
          donationId: donation.id,
          requestId,
        })
      } catch (notifErr) {
        console.warn('Notification dispatch notice:', notifErr)
      }

      // 6. Success state
      setExistingRequest(requestData)
      setActionSuccessMsg('Food request sent successfully. Request status: Pending.')
      if (onClaim) {
        onClaim({ ...donation, status: 'REQUESTED' })
      }
    } catch (err: any) {
      console.error('Failed to submit food request:', err)
      setActionErrorMsg('Failed to submit food request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const effectiveStatus = React.useMemo(() => {
    try {
      const localDonRaw = localStorage.getItem('foodconnect_local_donations')
      if (localDonRaw) {
        const list = JSON.parse(localDonRaw)
        const found = list.find((d: any) => d.id === donation.id || (donation.title && d.title === donation.title))
        if (found?.status) return found.status
      }
      const localReqRaw = localStorage.getItem('foodconnect_local_requests')
      if (localReqRaw) {
        const reqList = JSON.parse(localReqRaw)
        const foundReq = reqList.find(
          (r: any) =>
            (r.donationId === donation.id || (donation.title && r.foodTitle === donation.title)) &&
            r.status === 'ACCEPTED'
        )
        if (foundReq) return 'ACCEPTED'
      }
    } catch (_) {}
    return donation.status || 'AVAILABLE'
  }, [donation.id, donation.status, donation.title])

  const isDonationAvailable = effectiveStatus === 'AVAILABLE' || effectiveStatus === 'CREATED'
  const sc = statusConfig[effectiveStatus] || statusConfig.AVAILABLE
  const imgUrl = donation.imageUrls && donation.imageUrls.length > 0
    ? donation.imageUrls[0]
    : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop&auto=format'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative animate-scale-in">
        
        {/* Header Image */}
        <div className="relative h-40 sm:h-48 w-full bg-bg flex-shrink-0">
          <img src={imgUrl} alt={donation.title} className="w-full h-full object-cover rounded-t-3xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="absolute bottom-3 left-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${sc.bg}`}>
              <sc.icon className="w-3.5 h-3.5" />
              {sc.label}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-text-primary font-poppins">{donation.title}</h2>
              <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                donation.foodType === 'VEG' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {donation.foodType}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              ID: {donation.id} · Donor: <span className="font-semibold text-text-primary">{donation.donorName || 'Food Donor'}</span>
            </p>
          </div>

          {/* Feedback messages */}
          {actionSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {actionErrorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{actionErrorMsg}</span>
            </div>
          )}

          {/* Description */}
          {donation.description && (
            <div className="bg-bg p-3.5 sm:p-4 rounded-2xl border border-border">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1">Description</p>
              <p className="text-xs sm:text-sm text-text-primary leading-relaxed">{donation.description}</p>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="bg-bg p-3.5 rounded-2xl border border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-text-secondary uppercase">Quantity</p>
                <p className="text-sm font-bold text-text-primary">{donation.quantityDescription}</p>
              </div>
            </div>

            <div className="bg-bg p-3.5 rounded-2xl border border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-text-secondary uppercase">Est. Servings</p>
                <p className="text-sm font-bold text-text-primary">{donation.estimatedServings} Servings</p>
              </div>
            </div>
          </div>

          {/* Location & Time */}
          <div className="bg-bg p-4 rounded-2xl border border-border space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase">Pickup Location</p>
                <p className="text-sm font-medium text-text-primary">{donation.pickupAddress}</p>
                {donation.latitude && donation.longitude && (
                  <p className="text-[10px] text-text-secondary mt-0.5">GPS: {donation.latitude.toFixed(4)}, {donation.longitude.toFixed(4)}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="flex-1 flex justify-between items-center text-xs">
                <span className="text-text-secondary">Pickup Deadline:</span>
                <span className="font-semibold text-text-primary">
                  {donation.expiryTime ? new Date(donation.expiryTime).toLocaleString() : 'Within 4 hours'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border/60">
              {donation.deliveryMethod === 'VOLUNTEER_DELIVERY' ? (
                <Truck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              ) : (
                <Building className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
              <div className="flex-1 flex justify-between items-center text-xs">
                <span className="text-text-secondary">Delivery Method:</span>
                <span className="font-semibold text-text-primary">
                  {donation.deliveryMethod === 'VOLUNTEER_DELIVERY' ? 'Volunteer Delivery Required' : 'Recipient Self-Pickup'}
                </span>
              </div>
            </div>
          </div>

          {/* Donor View of Request Lifecycle */}
          {(userRole === 'donor' || currentUser?.role === 'DONOR') && (
            <div className="bg-bg rounded-2xl border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary uppercase tracking-wide">
                  Donation Request Status
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                  {sc.label}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {effectiveStatus === 'ACCEPTED'
                  ? 'Request Accepted! Food is reserved for recipient distribution. Volunteer coordination or pickup is active.'
                  : effectiveStatus === 'REQUESTED'
                  ? 'A recipient has submitted a request for this food. Review in Alerts or notifications.'
                  : 'This food donation is currently active and open for recipient requests.'}
              </p>
            </div>
          )}

          {/* Recipient Food Request Controls */}
          {isRecipientUser && (
            <div className="bg-primary-50/50 border border-primary-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Food Request Details
              </h3>

              {checkingExisting ? (
                <div className="flex items-center justify-center py-2 text-xs text-text-secondary gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Checking existing request status...</span>
                </div>
              ) : existingRequest ? (
                <div className="bg-surface rounded-xl p-3 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary">Your Request Status:</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      existingRequest.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : existingRequest.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {existingRequest.status || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    Requested {existingRequest.requestedServings || donation.estimatedServings} servings on{' '}
                    {existingRequest.requestedAt ? new Date(existingRequest.requestedAt).toLocaleDateString() : 'recently'}.
                  </p>
                </div>
              ) : !isDonationAvailable ? (
                <div className="bg-surface rounded-xl p-3 border border-border text-xs text-text-secondary">
                  This food donation is currently <span className="font-bold text-text-primary">{donation.status}</span> and cannot accept new requests.
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                      Servings Needed (Max: {donation.estimatedServings})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={donation.estimatedServings || 500}
                      value={requestedServings}
                      onChange={(e) => setRequestedServings(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                      Distribution Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dinner distribution for orphanage children"
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
            {isRecipientUser ? (
              existingRequest ? (
                <button
                  disabled
                  className="w-full sm:flex-1 bg-gray-100 text-gray-400 border border-gray-200 font-bold py-3.5 rounded-2xl text-xs cursor-not-allowed"
                >
                  Already Requested ({existingRequest.status})
                </button>
              ) : !isDonationAvailable ? (
                <button
                  disabled
                  className="w-full sm:flex-1 bg-gray-100 text-gray-400 border border-gray-200 font-bold py-3.5 rounded-2xl text-xs cursor-not-allowed"
                >
                  Donation Unavailable ({donation.status})
                </button>
              ) : (
                <button
                  onClick={handleRequestFood}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Request Food</span>
                    </>
                  )}
                </button>
              )
            ) : onClaim && isDonationAvailable ? (
              <button
                onClick={() => {
                  onClaim(donation)
                  onClose()
                }}
                className="w-full sm:flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg hover:bg-primary-dark transition-all cursor-pointer"
              >
                Claim This Donation
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="w-full sm:flex-1 bg-bg border border-border text-text-primary font-bold py-3.5 rounded-2xl text-xs sm:text-sm hover:bg-border transition-all cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
