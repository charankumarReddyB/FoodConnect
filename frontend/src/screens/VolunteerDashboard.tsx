import { Truck, MapPin, Bell, Clock, CheckCircle, Star, ChevronRight } from 'lucide-react'
import CheckInButton from '../components/CheckInButton'
import { useState, useEffect } from 'react'
import { donationApi, DonationItem, UserProfile } from '../services/api'
import { firestore } from '../config/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
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

  const [deliveries, setDeliveries] = useState<DonationItem[]>([])
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null)

  useEffect(() => {
    // Real-time Firestore stream for volunteer delivery items
    const q = query(collection(firestore, 'donations'), where('status', 'in', ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKED_UP']))
    const unsubscribe = onSnapshot(
      q,
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
        if (list.length > 0) setDeliveries(list)
      },
      (err) => {
        console.warn('Firestore volunteer live query warning:', err)
      }
    )

    return () => unsubscribe()
  }, [])

  const stats = [
    { label: 'Available Jobs', value: `${deliveries.length}`, sub: 'deliveries nearby', icon: Truck, color: 'bg-[#F3E5F5] text-[#6A1B9A]' },
    { label: 'Completed Today', value: '3', sub: 'deliveries made', icon: CheckCircle, color: 'bg-primary-50 text-primary' },
    { label: 'Hours Contributed', value: '4.5 hrs', sub: 'this week', icon: Clock, color: 'bg-accent-50 text-accent' },
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

        {/* Delivery tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary font-poppins">Available Delivery Tasks</h2>
            <button onClick={() => onNavigate('nearby')} className="flex items-center gap-1 text-sm text-[#6A1B9A] font-semibold hover:underline">
              View map <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveries.length === 0 ? (
              <div className="col-span-2 bg-surface rounded-2xl border border-border p-8 text-center text-text-secondary text-sm">
                No active delivery tasks pending right now. New delivery tasks will appear here as recipients request food!
              </div>
            ) : (
              deliveries.map((d) => {
                const imgUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop&auto=format'
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDonation(d)}
                    className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md cursor-pointer hover:border-primary transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
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
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                        <span>Pickup: {d.pickupAddress}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          alert(`Accepted delivery task for "${d.title}"! Contact donor at pickup location.`)
                        }}
                        className="flex-1 bg-[#6A1B9A] text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm hover:bg-[#4A148C]"
                      >
                        Accept Delivery Task
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Contribution streak */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-5 h-5 text-accent fill-accent" />
            <h2 className="text-base font-bold text-text-primary font-poppins">This Week's Activity</h2>
          </div>
          <div className="flex gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex-1 text-center">
                <div className={`h-12 rounded-xl mb-1.5 ${
                  i < 4 ? 'bg-[#6A1B9A]' : i === 4 ? 'bg-primary-100' : 'bg-bg border border-border'
                }`} style={{ height: `${[48, 32, 56, 40, 16, 0, 0][i] || 16}px` }} />
                <p className="text-[10px] text-text-secondary">{day}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-sm text-text-secondary">4-day streak 🔥</span>
            <span className="text-sm font-semibold text-[#6A1B9A]">Keep it up!</span>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <DonationDetailsModal
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
        userRole="volunteer"
      />
    </div>
  )
}
