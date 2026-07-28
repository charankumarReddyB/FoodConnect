import { Truck, MapPin, Bell, Clock, CheckCircle, Star, TrendingUp, ChevronRight, Navigation } from 'lucide-react'

type Screen = string
interface VolunteerDashboardProps {
  onNavigate: (screen: Screen) => void
}

const stats = [
  { label: 'Deliveries Done', value: '89', icon: CheckCircle, color: 'bg-[#F3E5F5] text-[#6A1B9A]' },
  { label: 'This Month', value: '12', icon: TrendingUp, color: 'bg-primary-50 text-primary' },
  { label: 'Km Covered', value: '342', icon: Navigation, color: 'bg-[#E3F2FD] text-[#1565C0]' },
  { label: 'Rating', value: '4.9★', icon: Star, color: 'bg-accent-50 text-accent' },
]

const nearbyDeliveries = [
  {
    id: 'DEL-501',
    food: 'Vegetable Biryani + Raita',
    qty: '15 kg',
    pickupFrom: 'Hotel Grand Palace, MG Road',
    deliverTo: 'Bethany Shelter, Indira Nagar',
    pickupDist: '1.2 km',
    deliveryDist: '3.4 km',
    reward: 'Impact Badge',
    urgent: true,
    donorImg: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=40&h=40&fit=crop&auto=format',
  },
  {
    id: 'DEL-500',
    food: 'Sambar Rice + Papad',
    qty: '10 kg',
    pickupFrom: 'Meenakshi Catering, BTM Layout',
    deliverTo: 'Green Future NGO, Koramangala',
    pickupDist: '0.6 km',
    deliveryDist: '2.1 km',
    reward: null,
    urgent: false,
    donorImg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=40&h=40&fit=crop&auto=format',
  },
]

const activeDelivery = {
  food: 'Idli Sambar + Chutney',
  qty: '20 kg',
  from: 'Anand Bhavan Restaurant',
  to: 'Hope Children Home',
  status: 'En route to recipient',
  step: 2,
}

export default function VolunteerDashboard({ onNavigate }: VolunteerDashboardProps) {
  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Top bar */}
      <div className="bg-[#4A148C] px-6 py-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-white/70 text-xs">Welcome back,</p>
            <h1 className="text-lg font-bold text-white font-poppins">Priya Nair 🚴</h1>
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
        {/* Availability toggle */}
        <div className="flex items-center gap-3 mt-3 bg-white/10 rounded-xl p-3">
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
            {nearbyDeliveries.map((d) => (
              <div key={d.id} className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                    <img src={d.donorImg} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary">{d.food}</p>
                      {d.urgent && (
                        <span className="text-[10px] font-bold bg-error/10 text-error px-2 py-0.5 rounded-full">URGENT</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{d.qty}</p>
                  </div>
                  {d.reward && (
                    <span className="text-[10px] font-semibold bg-accent-50 text-accent px-2.5 py-1 rounded-full flex-shrink-0">
                      🏅 {d.reward}
                    </span>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                    <span>Pickup: {d.pickupFrom} · <span className="text-primary font-medium">{d.pickupDist}</span></span>
                  </div>
                  <div className="ml-2.5 border-l-2 border-dashed border-border h-3" />
                  <div className="flex items-center gap-2.5 text-xs text-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-[#6A1B9A] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                    <span>Deliver: {d.deliverTo} · <span className="text-[#6A1B9A] font-medium">{d.deliveryDist}</span></span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#6A1B9A] text-white font-semibold py-2.5 rounded-xl text-sm shadow-sm hover:bg-[#4A148C]">
                    Accept Delivery
                  </button>
                  <button className="w-11 h-11 rounded-xl bg-bg border border-border flex items-center justify-center">
                    <Clock className="w-4 h-4 text-text-secondary" />
                  </button>
                </div>
              </div>
            ))}
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
