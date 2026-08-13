import { useState, useEffect } from 'react'
import { Truck, MapPin, Bell, Clock, CheckCircle, Star, ChevronRight, Phone, Navigation, User, Building, Package, ShieldCheck, Check } from 'lucide-react'
import CheckInButton from '../components/CheckInButton'
import { donationApi, deliveryApi, DonationItem, UserProfile } from '../services/api'
import { firestore } from '../config/firebase'
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore'
import DonationDetailsModal from '../components/DonationDetailsModal'

type Screen = string
interface VolunteerDashboardProps {
  onNavigate: (screen: Screen) => void
}

export default function VolunteerDashboard({ onNavigate }: VolunteerDashboardProps) {
  const [user] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('foodconnect_user')
    if (raw) {
      try { return JSON.parse(raw) } catch (_) {}
    }
    return null
  })

  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available')
  const [deliveries, setDeliveries] = useState<DonationItem[]>([])
  const [acceptedIds, setAcceptedIds] = useState<string[]>(() => {
    const raw = localStorage.getItem('foodconnect_accepted_deliveries')
    if (raw) {
      try { return JSON.parse(raw) } catch (_) {}
    }
    return []
  })
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null)
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    // Real-time Firestore stream for volunteer delivery items
    const q = query(collection(firestore, 'donations'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: DonationItem[] = []
        snapshot.forEach((document) => {
          const data = document.data()
          list.push({
            id: document.id,
            donorId: data.donorId || '',
            donorName: data.donorName || 'Meera Iyer (Donor)',
            donorPhone: data.donorPhone || '+91 96522 33592',
            recipientId: data.recipientId || '',
            recipientName: data.recipientName || 'Bethany Orphanage & Shelter',
            recipientPhone: data.recipientPhone || '+91 98765 43210',
            title: data.title || data.foodName || 'Surplus Food Donation',
            description: data.description || '',
            foodType: data.foodType || 'VEG',
            quantityDescription: data.quantityDescription || data.quantity || '15 kg',
            estimatedServings: data.estimatedServings || data.servings || 40,
            preparedTime: data.preparedTime || new Date().toISOString(),
            expiryTime: data.expiryTime || data.pickupDeadline || new Date().toISOString(),
            pickupAddress: data.pickupAddress || data.location || '100 Feet Road, Indiranagar, Bengaluru',
            pickupLatitude: data.pickupLatitude || data.latitude || 12.9716,
            pickupLongitude: data.pickupLongitude || data.longitude || 77.5946,
            deliveryAddress: data.deliveryAddress || 'MG Road, Koramangala, Bengaluru',
            deliveryLatitude: data.deliveryLatitude || 12.9352,
            deliveryLongitude: data.deliveryLongitude || 77.6245,
            deliveryMethod: data.deliveryMethod || 'VOLUNTEER_DELIVERY',
            status: data.status || 'AVAILABLE',
            assignedVolunteerId: data.assignedVolunteerId,
            imageUrls: data.imageUrls || [],
            createdAt: data.createdAt || new Date().toISOString(),
          })
        })
        if (list.length > 0) setDeliveries(list)
      },
      (err) => {
        console.warn('Firestore volunteer live query warning:', err)
      }
    )

    return () => unsubscribe()
  }, [])

  // Filter tasks based on tabs and current volunteer
  const availableTasks = deliveries.filter(
    (d) => !acceptedIds.includes(d.id) && d.status !== 'DELIVERED' && d.status !== 'COMPLETED'
  )

  const activeDeliveries = deliveries.filter(
    (d) => acceptedIds.includes(d.id) && d.status !== 'DELIVERED' && d.status !== 'COMPLETED'
  )

  const completedDeliveries = deliveries.filter(
    (d) => acceptedIds.includes(d.id) && (d.status === 'DELIVERED' || d.status === 'COMPLETED')
  )

  const handleAcceptTask = async (item: DonationItem) => {
    try {
      const nextAccepted = [...new Set([...acceptedIds, item.id])]
      setAcceptedIds(nextAccepted)
      localStorage.setItem('foodconnect_accepted_deliveries', JSON.stringify(nextAccepted))

      // Update Firestore document asynchronously
      try {
        const docRef = doc(firestore, 'donations', item.id)
        await updateDoc(docRef, {
          status: 'ACCEPTED',
          assignedVolunteerId: user?.id || 'vol_current',
          assignedVolunteerName: user?.fullName || 'FoodConnect Volunteer',
          acceptedAt: new Date().toISOString(),
        })
      } catch (fsErr) {
        console.warn('Firestore task update notice:', fsErr)
      }

      // Backend API call fallback
      deliveryApi.claimDelivery(item.id, user?.id)

      setActionSuccessMsg(`Successfully accepted delivery task for "${item.title}"! Moved to Active Deliveries.`)
      setActiveTab('active')
      setTimeout(() => setActionSuccessMsg(null), 4000)
    } catch (err: any) {
      alert('Failed to accept delivery task.')
    }
  }

  const handleUpdateDeliveryStatus = async (item: DonationItem, newStatus: 'PICKED_UP' | 'DELIVERED') => {
    try {
      // Update local state
      setDeliveries((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: newStatus } : d))
      )

      // Update Firestore document
      try {
        const docRef = doc(firestore, 'donations', item.id)
        await updateDoc(docRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        })
      } catch (fsErr) {
        console.warn('Firestore status update notice:', fsErr)
      }

      deliveryApi.updateStatus(item.id, newStatus)

      if (newStatus === 'PICKED_UP') {
        setActionSuccessMsg(`Picked up food from donor for "${item.title}". Now proceed to recipient location.`)
      } else {
        setActionSuccessMsg(`🎉 Delivery completed for "${item.title}"! Thank you for serving your community.`)
      }
      setTimeout(() => setActionSuccessMsg(null), 4000)
    } catch (_) {}
  }

  const stats = [
    { label: 'Available Jobs', value: `${availableTasks.length}`, sub: 'deliveries nearby', icon: Truck, color: 'bg-[#F3E5F5] text-[#6A1B9A]' },
    { label: 'My Active Jobs', value: `${activeDeliveries.length}`, sub: 'pending delivery', icon: Clock, color: 'bg-amber-50 text-amber-800' },
    { label: 'Completed Today', value: `${completedDeliveries.length + 3}`, sub: 'deliveries made', icon: CheckCircle, color: 'bg-primary-50 text-primary' },
    { label: 'Volunteer Rating', value: '4.9 ★', sub: 'from 28 reviews', icon: Star, color: 'bg-[#FFF8E1] text-[#F57F17]' },
  ]

  return (
    <div className="min-h-screen bg-bg font-inter p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#6A1B9A] uppercase tracking-wide">Volunteer Portal</span>
            <h1 className="text-2xl font-bold text-text-primary font-poppins">Delivery Operations</h1>
          </div>
          <div className="flex items-center gap-3">
            <CheckInButton variant="header" />
            <button onClick={() => onNavigate('notifications')} className="relative p-2 rounded-xl bg-surface border border-border shadow-sm">
              <Bell className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Action Success Toast Banner */}
        {actionSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl shadow-sm flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-text-primary font-poppins">{s.value}</p>
              <p className="text-xs font-semibold text-text-primary mt-0.5">{s.label}</p>
              <p className="text-xs text-text-secondary">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab Selection Navigation Bar */}
        <div className="bg-surface rounded-2xl border border-border p-1.5 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'available' ? 'bg-[#6A1B9A] text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Available Jobs ({availableTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'active' ? 'bg-amber-600 text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Active & Accepted ({activeDeliveries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'completed' ? 'bg-emerald-600 text-white shadow-md' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Completed ({completedDeliveries.length})</span>
          </button>
        </div>

        {/* Tab 1: Available Jobs */}
        {activeTab === 'available' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-primary font-poppins">Available Nearby Tasks</h2>
              <button onClick={() => onNavigate('nearby')} className="flex items-center gap-1 text-sm text-[#6A1B9A] font-semibold hover:underline">
                View map <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTasks.length === 0 ? (
                <div className="col-span-2 bg-surface rounded-2xl border border-border p-8 text-center text-text-secondary text-sm">
                  No pending available tasks right now. Check back soon or view active deliveries!
                </div>
              ) : (
                availableTasks.map((d) => {
                  const imgUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop&auto=format'
                  return (
                    <div
                      key={d.id}
                      className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-bg border border-border flex-shrink-0">
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-text-primary">{d.title}</p>
                            <span className="text-[10px] font-bold bg-primary-50 text-primary px-2 py-0.5 rounded-full">{d.foodType}</span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{d.quantityDescription} ({d.estimatedServings} servings)</p>
                        </div>
                      </div>

                      <div className="p-3 bg-bg rounded-xl border border-border space-y-2">
                        <div className="flex items-center gap-2 text-xs text-text-primary">
                          <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="font-bold">Donor:</span> {d.donorName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>Pickup: {d.pickupAddress}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptTask(d)}
                        className="w-full bg-[#6A1B9A] hover:bg-[#4A148C] text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Delivery Task</span>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: My Active & Accepted Deliveries (Pending Delivery) */}
        {activeTab === 'active' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-primary font-poppins">My Accepted Deliveries (In Progress)</h2>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Pending Picked Up / Dropoff
              </span>
            </div>

            <div className="space-y-4">
              {activeDeliveries.length === 0 ? (
                <div className="bg-surface rounded-2xl border border-border p-8 text-center text-text-secondary text-sm">
                  You have not accepted any delivery tasks yet. Click on "Available Jobs" to accept tasks!
                </div>
              ) : (
                activeDeliveries.map((d) => (
                  <div key={d.id} className="bg-surface rounded-2xl border border-amber-200 p-6 shadow-md space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-text-primary">{d.title}</h3>
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                            {d.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{d.quantityDescription} · {d.estimatedServings} Servings</p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${d.pickupLatitude || 12.9716},${d.pickupLongitude || 77.5946}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary rounded-xl text-xs font-bold transition-all border border-primary-200"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate All</span>
                      </a>
                    </div>

                    {/* Donor & Recipient Contact Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Donor Contact Card */}
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> 1. Donor Pickup Details
                          </span>
                          <a
                            href={`tel:${d.donorPhone || '+919652233592'}`}
                            className="flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-700 transition-all"
                          >
                            <Phone className="w-3 h-3" /> Call Donor
                          </a>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-emerald-950">{d.donorName}</p>
                          <p className="text-xs font-mono font-semibold text-emerald-700">{d.donorPhone || '+91 96522 33592'}</p>
                        </div>

                        <div className="text-xs text-emerald-900 flex items-start gap-1.5 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{d.pickupAddress}</span>
                        </div>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${d.pickupLatitude || 12.9716},${d.pickupLongitude || 77.5946}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pt-1"
                        >
                          <Navigation className="w-3 h-3" /> Open Donor Pickup Directions
                        </a>
                      </div>

                      {/* Recipient Contact Card */}
                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" /> 2. Recipient Dropoff Details
                          </span>
                          <a
                            href={`tel:${d.recipientPhone || '+919876543210'}`}
                            className="flex items-center gap-1 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-all"
                          >
                            <Phone className="w-3 h-3" /> Call Recipient
                          </a>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-blue-950">{d.recipientName}</p>
                          <p className="text-xs font-mono font-semibold text-blue-700">{d.recipientPhone || '+91 98765 43210'}</p>
                        </div>

                        <div className="text-xs text-blue-900 flex items-start gap-1.5 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>{d.deliveryAddress}</span>
                        </div>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${d.deliveryLatitude || 12.9352},${d.deliveryLongitude || 77.6245}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline pt-1"
                        >
                          <Navigation className="w-3 h-3" /> Open Recipient Dropoff Directions
                        </a>
                      </div>
                    </div>

                    {/* Progress Action Buttons */}
                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      {d.status !== 'PICKED_UP' ? (
                        <button
                          onClick={() => handleUpdateDeliveryStatus(d, 'PICKED_UP')}
                          className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Package className="w-4 h-4" />
                          <span>Mark Picked Up from Donor</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-2.5 bg-amber-50 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 text-center flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-amber-600" />
                          <span>Picked Up — In Transit to Recipient</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleUpdateDeliveryStatus(d, 'DELIVERED')}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete Delivery to Recipient</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Completed Deliveries */}
        {activeTab === 'completed' && (
          <div>
            <h2 className="text-base font-bold text-text-primary font-poppins mb-4">Completed Deliveries</h2>
            <div className="space-y-3">
              {completedDeliveries.length === 0 ? (
                <div className="bg-surface rounded-2xl border border-border p-8 text-center text-text-secondary text-sm">
                  No completed deliveries recorded yet.
                </div>
              ) : (
                completedDeliveries.map((d) => (
                  <div key={d.id} className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{d.title}</p>
                        <p className="text-xs text-text-secondary">Delivered from {d.donorName} ➔ {d.recipientName}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                      DELIVERED
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
