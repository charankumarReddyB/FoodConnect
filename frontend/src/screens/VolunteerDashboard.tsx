import { Truck, MapPin, Bell, Clock, CheckCircle, Star, TrendingUp, ChevronRight, Navigation } from 'lucide-react'
import CheckInButton from '../components/CheckInButton'
import { useState, useEffect } from 'react'
import { donationApi, DonationItem, UserProfile } from '../services/api'
import { firestore } from '../config/firebase'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

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

  useEffect(() => {
    // Real-time Firestore stream for volunteer delivery items
    const q = query(collection(firestore, 'donations'), where('status', 'in', ['AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKED_UP']))
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
          pickupAddress: data.pickupAddress || data.location || 'Central Pickup Point',
          deliveryMethod: data.deliveryMethod || 'VOLUNTEER_DELIVERY',
          status: data.status || 'AVAILABLE',
          imageUrls: data.imageUrls || [],
          createdAt: data.createdAt || new Date().toISOString(),
        })
      })
      setDeliveries(list)
    })

    return () => unsubscribe()
  }, [])

  const stats = [
    { label: 'Deliveries Available', value: `${deliveries.length}`, icon: CheckCircle, color: 'bg-[#F3E5F5] text-[#6A1B9A]' },
    { label: 'Active Tasks', value: `${deliveries.filter(d => d.status === 'REQUESTED' || d.status === 'ACCEPTED').length}`, icon: TrendingUp, color: 'bg-primary-50 text-primary' },
    { label: 'Km Covered', value: '342', icon: Navigation, color: 'bg-[#E3F2FD] text-[#1565C0]' },
    { label: 'Rating', value: '4.9★', icon: Star, color: 'bg-accent-50 text-accent' },
  ]
  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Top bar */}
      <div className="bg-[#4A148C] px-6 py-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-white/70 text-xs">Welcome back,</p>
            <h1 className="text-lg font-bold text-white font-poppins">Priya Nair</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('notifications')} className="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
            <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-sm flex items-center justify-center font-poppins">
              P
            </button>
          </div>
        </div>

        {/* Availability toggle & Check-in */}
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Available for Deliveries</p>
              <p className="text-white/60 text-xs">Receiving nearby requests</p>
            </div>
            <div className="relative">
              <div className="w-12 h-6 bg-success rounded-full flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow ml-auto" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Shift Check-in</p>
              <p className="text-white/60 text-xs">Record attendance for today</p>
            </div>
            <CheckInButton variant="header" eventId="EVT-VOLUNTEER-SHIFT" location="MG Road Hub" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-text-primary font-poppins">{s.value}</p>
              <p className="text-xs font-semibold text-text-primary mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active delivery */}
        <div className="bg-gradient-to-r from-[#4A148C] to-[#6A1B9A] rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5" />
              <span className="text-sm font-semibold opacity-80">Active Delivery</span>
            </div>
            <p className="text-lg font-bold font-poppins mb-1">{activeDelivery.food}</p>
            <p className="text-white/70 text-sm mb-4">{activeDelivery.qty} · {activeDelivery.status}</p>
            {/* Stepper */}
            <div className="flex items-center gap-2 mb-4">
              {['Pickup', 'En Route', 'Delivered'].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i < activeDelivery.step ? 'bg-white border-white text-[#4A148C]'
                    : i === activeDelivery.step ? 'border-white text-white'
                    : 'border-white/30 text-white/30'
                  }`}>
                    {i < activeDelivery.step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs ${i <= activeDelivery.step ? 'text-white' : 'text-white/40'}`}>{step}</span>
                  {i < 2 && <div className={`flex-1 h-0.5 w-4 rounded-full ${i < activeDelivery.step ? 'bg-white' : 'bg-white/20'}`} />}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-white/10 rounded-xl p-3">
                <p className="text-[10px] opacity-70 mb-0.5">Pickup</p>
                <p className="text-xs font-semibold">{activeDelivery.from}</p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl p-3">
                <p className="text-[10px] opacity-70 mb-0.5">Deliver to</p>
                <p className="text-xs font-semibold">{activeDelivery.to}</p>
              </div>
            </div>
            <button className="mt-4 w-full bg-white text-[#4A148C] font-semibold py-2.5 rounded-xl text-sm shadow">
              Mark as Delivered ✓
            </button>
          </div>
        </div>

        {/* Nearby deliveries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-primary font-poppins">Nearby Requests</h2>
            <button onClick={() => onNavigate('nearby')} className="flex items-center gap-1 text-sm text-[#6A1B9A] font-semibold hover:underline">
              View map <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {deliveries.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-border p-8 text-center text-text-secondary text-sm">
                No active delivery requests right now. When donors post surplus food or recipients request food, new delivery tasks will appear here in real-time!
              </div>
            ) : (
              deliveries.map((d) => {
                const imgUrl = d.imageUrls && d.imageUrls.length > 0 ? d.imageUrls[0] : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=40&h=40&fit=crop&auto=format'
                return (
                  <div key={d.id} className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-border">
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
                        onClick={() => alert(`Accepted delivery task for "${d.title}"! Contact donor at pickup location.`)}
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
    </div>
  )
}
