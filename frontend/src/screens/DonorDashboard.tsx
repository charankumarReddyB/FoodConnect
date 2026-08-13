import { useState, useEffect } from 'react'
import { PlusCircle, Package, Clock, CheckCircle, XCircle, TrendingUp, MapPin, Bell, ChevronRight, Leaf, Users } from 'lucide-react'
import { donationApi, DonationItem, UserProfile } from '../services/api'
import { firestore } from '../config/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

type Screen = string
interface DonorDashboardProps {
  onNavigate: (screen: Screen) => void
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  DELIVERED: { label: 'Delivered', bg: 'bg-success/10', text: 'text-success', icon: CheckCircle },
  COMPLETED: { label: 'Completed', bg: 'bg-success/10', text: 'text-success', icon: CheckCircle },
  IN_TRANSIT: { label: 'In Transit', bg: 'bg-accent-50', text: 'text-accent', icon: TrendingUp },
  PICKED_UP: { label: 'Picked Up', bg: 'bg-accent-50', text: 'text-accent', icon: TrendingUp },
  ACCEPTED: { label: 'Accepted', bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', icon: CheckCircle },
  REQUESTED: { label: 'Requested', bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]', icon: Clock },
  AVAILABLE: { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Clock },
  CREATED: { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Clock },
  CANCELLED: { label: 'Cancelled', bg: 'bg-[#FFEBEE]', text: 'text-error', icon: XCircle },
  EXPIRED: { label: 'Expired', bg: 'bg-[#FFEBEE]', text: 'text-error', icon: XCircle },
}

const quickActions = [
  { label: 'Post Food', icon: PlusCircle, screen: 'post-donation', color: 'bg-primary text-white' },
  { label: 'Nearby NGOs', icon: MapPin, screen: 'nearby', color: 'bg-primary-50 text-primary' },
  { label: 'Notifications', icon: Bell, screen: 'notifications', color: 'bg-accent-50 text-accent' },
  { label: 'History', icon: Package, screen: 'history', color: 'bg-[#E3F2FD] text-[#1565C0]' },
]

export default function DonorDashboard({ onNavigate }: DonorDashboardProps) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('foodconnect_user')
    if (raw) {
      try { return JSON.parse(raw) } catch (_) {}
    }
    return null
  })

  const [donations, setDonations] = useState<DonationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: () => void = () => {}

    // 1. Initial Local Storage & REST API load
    const loadInitialData = async () => {
      try {
        const localRaw = localStorage.getItem('foodconnect_local_donations')
        const localList: DonationItem[] = localRaw ? JSON.parse(localRaw) : []

        if (user?.id) {
          const res = await donationApi.getMyDonations(user.id).catch(() => null)
          const apiList = res?.content || []
          const combined = [...localList, ...apiList.filter(a => !localList.some(l => l.id === a.id))]
          setDonations(combined)
        } else {
          const res = await donationApi.getDonations().catch(() => null)
          const apiList = res?.content || []
          const combined = [...localList, ...apiList.filter(a => !localList.some(l => l.id === a.id))]
          setDonations(combined)
        }
      } catch (_) {} finally {
        setLoading(false)
      }
    }

    loadInitialData()

    // 2. Real-time Cloud Firestore synchronization
    try {
      const q = user?.id
        ? query(collection(firestore, 'donations'), where('donorId', '==', user.id))
        : collection(firestore, 'donations')

      unsubscribe = onSnapshot(q, (snapshot) => {
        const liveList: DonationItem[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          liveList.push({
            id: doc.id,
            donorId: data.donorId || '',
            donorName: data.donorName || 'Me',
            title: data.title || data.foodName || 'Surplus Food',
            description: data.description || '',
            foodType: data.foodType || 'VEG',
            quantityDescription: data.quantityDescription || data.quantity || '10 kg',
            estimatedServings: data.estimatedServings || data.servings || 20,
            preparedTime: data.preparedTime || new Date().toISOString(),
            expiryTime: data.expiryTime || data.pickupDeadline || new Date().toISOString(),
            pickupAddress: data.pickupAddress || data.location || 'Local Address',
            deliveryMethod: data.deliveryMethod || 'VOLUNTEER_DELIVERY',
            status: data.status || 'AVAILABLE',
            imageUrls: data.imageUrls || [],
            createdAt: data.createdAt || new Date().toISOString(),
          })
        })

        const localRaw = localStorage.getItem('foodconnect_local_donations')
        const localList: DonationItem[] = localRaw ? JSON.parse(localRaw) : []
        const merged = [...localList, ...liveList.filter(l => !localList.some(loc => loc.id === l.id))]

        if (merged.length > 0) {
          setDonations(merged)
          setLoading(false)
        }
      })
    } catch (_) {}

    return () => unsubscribe()
  }, [user?.id])

  const totalServings = donations.reduce((acc, d) => acc + (d.estimatedServings || 0), 0)
  const activeCount = donations.filter(d => d.status === 'AVAILABLE' || d.status === 'CREATED' || d.status === 'REQUESTED' || d.status === 'ACCEPTED').length

  const stats = [
    { label: 'Total Donations', value: `${donations.length}`, sub: 'recorded in Firestore', icon: Package, color: 'bg-primary-50 text-primary', trend: '+Live' },
    { label: 'Meals Provided', value: `${totalServings}`, sub: 'approx. servings', icon: Users, color: 'bg-accent-50 text-accent', trend: '+Live' },
    { label: 'Food Saved (kg)', value: `${Math.round(totalServings * 0.3)}`, sub: 'from landfill', icon: Leaf, color: 'bg-[#E3F2FD] text-[#1565C0]', trend: '' },
    { label: 'Active Donations', value: `${activeCount}`, sub: 'available / pending', icon: Clock, color: 'bg-[#F3E5F5] text-[#6A1B9A]', trend: '' },
  ]

  const userNameDisplay = user?.fullName || 'Food Donor'
  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-text-secondary">Good morning,</p>
          <h1 className="text-lg font-bold text-text-primary font-poppins">Arjun Sharma 👋</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('notifications')} className="relative w-10 h-10 rounded-xl bg-bg flex items-center justify-center hover:bg-border">
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
          </button>
          <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center font-poppins">
            A
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* Hero CTA */}
        <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -right-2 top-8 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative">
            <p className="text-white/80 text-sm mb-1 font-medium">You have surplus food?</p>
            <h2 className="text-xl font-bold font-poppins mb-4">Post a donation in 60 seconds</h2>
            <button
              onClick={() => onNavigate('post-donation')}
              className="flex items-center gap-2 bg-white text-primary font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Post Food Now
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
                {s.trend && (
                  <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                    {s.trend}
                  </span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-text-primary font-poppins">{s.value}</p>
              <p className="text-xs font-semibold text-text-primary mt-0.5">{s.label}</p>
              <p className="text-xs text-text-secondary">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((q) => (
              <button
                key={q.label}
                onClick={() => onNavigate(q.screen)}
                className="flex flex-col items-center gap-2 bg-surface rounded-2xl border border-border py-5 px-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl ${q.color} flex items-center justify-center`}>
                  <q.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-text-primary text-center">{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent donations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-primary font-poppins">Recent Donations</h2>
            <button onClick={() => onNavigate('history')} className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            {donations.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                No food donations posted yet. Click <span className="font-semibold text-primary">Post Food Now</span> to list your surplus food in Cloud Firestore!
              </div>
            ) : (
              donations.slice(0, 5).map((d, i) => {
                const sc = statusConfig[d.status] || statusConfig.AVAILABLE
                const imgUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop&auto=format'
                return (
                  <div
                    key={d.id}
                    className={`flex items-center gap-4 p-4 hover:bg-bg cursor-pointer ${i < donations.length - 1 ? 'border-b border-border' : ''}`}
                    onClick={() => onNavigate('history')}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-bg border border-border">
                      <img src={imgUrl} alt={d.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary truncate">{d.title}</p>
                        <span className="text-xs text-text-secondary hidden sm:block">· {d.quantityDescription}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{d.pickupAddress} · {d.estimatedServings} servings</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        <sc.icon className="w-3.5 h-3.5" />
                        {sc.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-text-secondary" />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Impact card */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text-primary font-poppins">Your Environmental Impact</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '312 kg', label: 'Food saved from waste' },
              { value: '156 kg', label: 'CO₂ emissions avoided' },
              { value: '1,240', label: 'People fed this year' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xl font-extrabold text-primary font-poppins">{item.value}</p>
                <p className="text-xs text-text-secondary mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-bg rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-secondary">Monthly goal: 500 kg saved</span>
              <span className="text-xs font-bold text-primary">62%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '62%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
