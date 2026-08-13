import React from 'react'
import { X, MapPin, Clock, Users, Package, CheckCircle, TrendingUp, AlertCircle, Truck, Building } from 'lucide-react'
import { DonationItem } from '../services/api'

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

export default function DonationDetailsModal({ donation, onClose, onClaim }: DonationDetailsModalProps) {
  if (!donation) return null

  const sc = statusConfig[donation.status] || statusConfig.AVAILABLE
  const imgUrl = donation.imageUrls && donation.imageUrls.length > 0
    ? donation.imageUrls[0]
    : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop&auto=format'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative animate-scale-in">
        
        {/* Header Image */}
        <div className="relative h-48 w-full bg-bg">
          <img src={imgUrl} alt={donation.title} className="w-full h-full object-cover rounded-t-3xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${sc.bg}`}>
              <sc.icon className="w-3.5 h-3.5" />
              {sc.label}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-text-primary font-poppins">{donation.title}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                donation.foodType === 'VEG' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {donation.foodType}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">ID: {donation.id} · Posted by <span className="font-semibold text-text-primary">{donation.donorName || 'Food Donor'}</span></p>
          </div>

          {/* Description */}
          {donation.description && (
            <div className="bg-bg p-4 rounded-2xl border border-border">
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-text-primary leading-relaxed">{donation.description}</p>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
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
                <p className="text-[10px] font-semibold text-text-secondary uppercase">Servings</p>
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
                  {donation.deliveryMethod === 'VOLUNTEER_DELIVERY' ? 'Volunteer Delivery' : 'Recipient Self-Pickup'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            {onClaim && donation.status === 'AVAILABLE' && (
              <button
                onClick={() => {
                  onClaim(donation)
                  onClose()
                }}
                className="flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg hover:bg-primary-dark transition-all"
              >
                Claim This Donation
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-bg border border-border text-text-primary font-bold py-3.5 rounded-2xl text-sm hover:bg-border transition-all"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
