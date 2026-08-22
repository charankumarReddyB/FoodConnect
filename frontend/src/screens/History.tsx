import { ArrowLeft, Package, CheckCircle, Clock, XCircle, TrendingUp, Filter, ChevronRight, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { donationApi, DonationItem, UserProfile } from '../services/api'
import { firestore } from '../config/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import DonationDetailsModal from '../components/DonationDetailsModal'

type Role = 'donor' | 'recipient' | 'volunteer' | 'admin'
interface HistoryProps {
  onBack: () => void
  role: Role
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
  EXPIRED: { label: 'Expired', bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  CANCELLED: { label: 'Cancelled', bg: 'bg-[#FFEBEE]', text: 'text-error', icon: XCircle },
}

export default function History({ onBack, role }: HistoryProps) {
  const [user] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('foodconnect_user')
    if (raw) {
      try { return JSON.parse(raw) } catch (_) {}
    }
    return null
  })

  const [donations, setDonations] = useState<DonationItem[]>([])
  const [filter, setFilter] = useState<'all' | 'delivered' | 'pending' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null)

  useEffect(() => {
    // 1. REST API load
    const loadApi = async () => {
      try {
        if (user?.id) {
          const res = await donationApi.getMyDonations(user.id)
          if (res?.content && res.content.length > 0) setDonations(res.content)
        } else {
          const res = await donationApi.getDonations()
          if (res?.content && res.content.length > 0) setDonations(res.content)
        }
      } catch (_) {}
    }
    loadApi()

    // 2. Real-time Firestore stream
    const unsubscribe = onSnapshot(
      collection(firestore, 'donations'),
      (snapshot) => {
        const list: DonationItem[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          list.push({
            id: doc.id,
            donorId: data.donorId || '',
            donorName: data.donorName || 'Food Donor',
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
        if (list.length > 0) setDonations(list)
      },
      (err) => {
        console.warn('Firestore history live query warning:', err)
      }
    )

    return () => unsubscribe()
  }, [user?.id])

  const filtered = donations.filter((d) => {
    const matchStatus =
      filter === 'all' ||
      (filter === 'delivered' && (d.status === 'DELIVERED' || d.status === 'COMPLETED')) ||
      (filter === 'pending' && (d.status === 'AVAILABLE' || d.status === 'CREATED' || d.status === 'REQUESTED' || d.status === 'ACCEPTED')) ||
      (filter === 'cancelled' && (d.status === 'CANCELLED' || d.status === 'EXPIRED'))

    const matchQuery =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase())

    return matchStatus && matchQuery
  })

  const deliveredCount = donations.filter((d) => d.status === 'DELIVERED' || d.status === 'COMPLETED').length

  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-text-primary font-poppins">Donation History</h1>
            <p className="text-xs text-text-secondary">{donations.length} total · {deliveredCount} delivered</p>
          </div>
          <button className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center">
            <Filter className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search donations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-surface border-b border-border px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
        {(['all', 'delivered', 'pending', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              filter === f ? 'bg-primary text-white' : 'bg-bg text-text-secondary border border-border'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-4 max-w-2xl mx-auto">
        {[
          { label: 'Delivered', value: deliveredCount, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Total Recorded', value: `${donations.length}`, color: 'text-primary', bg: 'bg-primary-50' },
          { label: 'Meals Provided', value: `${donations.reduce((acc, d) => acc + (d.estimatedServings || 0), 0)}`, color: 'text-accent', bg: 'bg-accent-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 sm:p-4 text-center`}>
            <p className={`text-lg sm:text-xl font-extrabold font-poppins ${s.color}`}>{s.value}</p>
            <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>


      {/* List */}
      <div className="max-w-2xl mx-auto px-4 space-y-3 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-border mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No donations found</p>
            <p className="text-xs text-text-secondary mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          filtered.map((d) => {
            const sc = statusConfig[d.status] || statusConfig.AVAILABLE
            const imgUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop&auto=format'
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDonation(d)}
                className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4 shadow-sm hover:shadow-md cursor-pointer hover:border-primary transition-all"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                  <img src={imgUrl} alt={d.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{d.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{d.pickupAddress} · {d.quantityDescription}</p>
                  <p className="text-xs text-text-secondary">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Today'}</p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${sc.bg} ${sc.text}`}>
                    <sc.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {sc.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-secondary shrink-0" />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Details Modal */}
      <DonationDetailsModal
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
        userRole={role}
      />
    </div>
  )
}
