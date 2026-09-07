import React, { useState } from 'react'
import { X, CheckCircle, XCircle, Clock, MapPin, Users, Package, Truck, Building, AlertCircle, Loader2 } from 'lucide-react'
import { DonationItem, requestApi } from '../services/api'
import { firestore } from '../config/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { notifyPartiesOnAction } from '../services/notificationService'

export interface FoodRequestItem {
  id: string
  donationId: string
  donorId?: string
  donorName?: string
  recipientId?: string
  recipientName?: string
  recipientPhone?: string
  foodTitle?: string
  quantityDescription?: string
  requestedServings?: number
  notes?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string
  pickupAddress?: string
  deliveryMethod?: string
  requestedAt?: string
  createdAt?: string
}

interface RequestReviewModalProps {
  request: FoodRequestItem | null
  donation: DonationItem | null
  onClose: () => void
  onStatusChange?: (requestId: string, newStatus: 'ACCEPTED' | 'REJECTED') => void
}

export default function RequestReviewModal({
  request,
  donation,
  onClose,
  onStatusChange,
}: RequestReviewModalProps) {
  if (!request && !donation) return null

  const [currentStatus, setCurrentStatus] = useState<string>(request?.status || 'PENDING')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const foodTitle = donation?.title || request?.foodTitle || 'Food Donation'
  const recipientName = request?.recipientName || 'Recipient Organization'
  const servings = request?.requestedServings || donation?.estimatedServings || 10
  const quantityDesc = donation?.quantityDescription || request?.quantityDescription || 'Standard Portion'
  const pickupAddress = donation?.pickupAddress || request?.pickupAddress || 'Donor Pickup Location'
  const deliveryMethod = donation?.deliveryMethod || request?.deliveryMethod || 'VOLUNTEER_DELIVERY'
  const requestDate = request?.requestedAt || request?.createdAt
  const requestId = request?.id

  const handleRespond = async (status: 'ACCEPTED' | 'REJECTED') => {
    if (!requestId) return

    setIsProcessing(true)
    setFeedbackMessage(null)

    try {
      const nowIso = new Date().toISOString()

      // 1. Update request record in Firestore
      try {
        const reqRef = doc(firestore, 'requests', requestId)
        await updateDoc(reqRef, {
          status,
          updatedAt: nowIso,
          respondedAt: nowIso,
        })
      } catch (_) {}

      try {
        const donReqRef = doc(firestore, 'donation_requests', requestId)
        await updateDoc(donReqRef, {
          status,
          updatedAt: nowIso,
          respondedAt: nowIso,
        })
      } catch (_) {}

      // 2. Update donation status in Firestore
      const targetDonationId = donation?.id || request?.donationId
      if (targetDonationId) {
        try {
          const donationRef = doc(firestore, 'donations', targetDonationId)
          await updateDoc(donationRef, {
            status: status === 'ACCEPTED' ? 'ACCEPTED' : 'AVAILABLE',
            updatedAt: nowIso,
          })
        } catch (_) {}
      }

      // 3. Update local request cache
      try {
        const raw = localStorage.getItem('foodconnect_local_requests')
        if (raw) {
          const list = JSON.parse(raw)
          const updated = list.map((item: any) =>
            item.id === requestId ? { ...item, status, updatedAt: nowIso, respondedAt: nowIso } : item
          )
          localStorage.setItem('foodconnect_local_requests', JSON.stringify(updated))
        }
      } catch (_) {}

      // 4. Update local donation cache and sync status
      const newDonStatus = status === 'ACCEPTED' ? 'ACCEPTED' : 'AVAILABLE'
      try {
        const donRaw = localStorage.getItem('foodconnect_local_donations')
        const list: any[] = donRaw ? JSON.parse(donRaw) : []
        let matched = false
        const updatedDons = list.map((d: any) => {
          const matchId = targetDonationId && d.id === targetDonationId
          const matchTitle = foodTitle && d.title && d.title.trim().toLowerCase() === foodTitle.trim().toLowerCase()
          if (matchId || matchTitle) {
            matched = true
            return {
              ...d,
              status: newDonStatus,
              updatedAt: nowIso,
            }
          }
          return d
        })

        if (!matched && targetDonationId) {
          updatedDons.unshift({
            id: targetDonationId,
            donorId: donation?.donorId || request?.donorId || '',
            donorName: donation?.donorName || request?.donorName || 'Food Donor',
            title: foodTitle,
            description: donation?.description || '',
            foodType: donation?.foodType || 'VEG',
            quantityDescription: quantityDesc,
            estimatedServings: servings,
            preparedTime: nowIso,
            expiryTime: donation?.expiryTime || nowIso,
            pickupAddress,
            deliveryMethod,
            status: newDonStatus,
            imageUrls: donation?.imageUrls || [],
            createdAt: requestDate || nowIso,
            updatedAt: nowIso,
          })
        }

        localStorage.setItem('foodconnect_local_donations', JSON.stringify(updatedDons))
      } catch (_) {}

      // 5. Dispatch global event so all screens (Donation History, Dashboard) update instantly
      try {
        window.dispatchEvent(
          new CustomEvent('foodconnect_donation_updated', {
            detail: {
              donationId: targetDonationId,
              foodTitle,
              status: newDonStatus,
              requestId,
            },
          })
        )
        window.dispatchEvent(new Event('storage'))
      } catch (_) {}

      // 6. Inform Spring Boot REST API
      requestApi.respondToRequest(requestId, status).catch((err) => {
        console.log('Background REST respond call notice:', err)
      })

      // 7. Send real-time notifications
      const isVolDelivery = deliveryMethod === 'VOLUNTEER_DELIVERY'
      try {
        await notifyPartiesOnAction({
          action: status,
          foodTitle,
          donorName: donation?.donorName || request?.donorName,
          donorId: donation?.donorId || request?.donorId,
          recipientName,
          recipientId: request?.recipientId,
          donationId: targetDonationId,
          requestId,
          volunteerDeliveryRequired: status === 'ACCEPTED' && isVolDelivery,
        })
      } catch (notifErr) {
        console.warn('Notification dispatch error caught:', notifErr)
      }

      setCurrentStatus(status)
      if (status === 'ACCEPTED') {
        setFeedbackMessage({
          type: 'success',
          text: `Request accepted! Recipient has been notified.${
            isVolDelivery ? ' Nearby volunteers have been notified for delivery assistance.' : ''
          }`,
        })
      } else {
        setFeedbackMessage({
          type: 'success',
          text: 'Request rejected. This donation post is back to Available for other recipients.',
        })
      }

      if (onStatusChange) {
        onStatusChange(requestId, status)
      }
    } catch (err: any) {
      console.error('Error responding to request:', err)
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to update request. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative animate-scale-in">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary font-poppins">Food Request Review</h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  currentStatus === 'ACCEPTED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : currentStatus === 'REJECTED'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Review and respond to food requests for your active donations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg border border-border hover:bg-border text-text-primary flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
          
          {/* Feedback message banner */}
          {feedbackMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Recipient Details Card */}
          <div className="bg-bg p-4 rounded-2xl border border-border space-y-2">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Recipient Organization</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-text-primary">{recipientName}</p>
              {request?.recipientPhone && (
                <span className="text-xs text-text-secondary font-medium">{request.recipientPhone}</span>
              )}
            </div>
            {requestDate && (
              <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-text-secondary" />
                Requested on {new Date(requestDate).toLocaleString()}
              </p>
            )}
          </div>

          {/* Requested Food Info */}
          <div className="bg-bg p-4 rounded-2xl border border-border space-y-3">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Donation Item</p>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-bold text-text-primary font-poppins">{foodTitle}</p>
                <p className="text-xs text-text-secondary mt-0.5">{quantityDesc}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-primary bg-primary-50 px-2.5 py-1 rounded-lg">
                  {servings} Servings Requested
                </span>
              </div>
            </div>

            {/* Recipient Notes */}
            {request?.notes && (
              <div className="pt-2 border-t border-border/60">
                <p className="text-[10px] font-semibold text-text-secondary uppercase">Recipient Note</p>
                <p className="text-xs text-text-primary mt-0.5 italic">"{request.notes}"</p>
              </div>
            )}
          </div>

          {/* Pickup & Delivery Details */}
          <div className="bg-bg p-4 rounded-2xl border border-border space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-text-secondary font-semibold uppercase text-[10px]">Pickup Location</span>
                <p className="text-text-primary font-medium">{pickupAddress}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-border/60">
              {deliveryMethod === 'VOLUNTEER_DELIVERY' ? (
                <Truck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              ) : (
                <Building className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
              <div className="flex-1 flex justify-between items-center">
                <span className="text-text-secondary">Method:</span>
                <span className="font-semibold text-text-primary">
                  {deliveryMethod === 'VOLUNTEER_DELIVERY' ? 'Volunteer Delivery' : 'Recipient Self-Pickup'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            {currentStatus === 'PENDING' ? (
              <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
                <button
                  onClick={() => handleRespond('ACCEPTED')}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept Request</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleRespond('REJECTED')}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 bg-surface border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Request</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-2xl text-center text-xs font-semibold ${
                    currentStatus === 'ACCEPTED'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  Request has been marked as <span className="font-bold uppercase">{currentStatus}</span>.
                </div>
                <button
                  onClick={onClose}
                  className="w-full bg-bg border border-border text-text-primary font-bold py-3.5 rounded-2xl text-xs sm:text-sm hover:bg-border transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
