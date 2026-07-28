import { MapPin, Bell, ChevronRight, Clock, CheckCircle, Package, Users, TrendingUp, Search, Filter } from 'lucide-react'

type Screen = string
interface RecipientDashboardProps {
  onNavigate: (screen: Screen) => void
}

const stats = [
  { label: 'Total Received', value: '234', sub: 'meals this year', icon: Package, color: 'bg-[#E3F2FD] text-[#1565C0]' },
  { label: 'Pending Requests', value: '2', sub: 'awaiting response', icon: Clock, color: 'bg-accent-50 text-accent' },
  { label: 'People Served', value: '4,800', sub: 'beneficiaries', icon: Users, color: 'bg-primary-50 text-primary' },
  { label: 'Monthly Target', value: '78%', sub: '39 / 50 meals', icon: TrendingUp, color: 'bg-[#F3E5F5] text-[#6A1B9A]' },
]

const nearbyFood = [
  {
    id: 'F-201',
    name: 'Chicken Curry + Rice',
    donor: 'Hotel Saraswati',
    qty: '25 kg · ~80 servings',
    dist: '0.8 km',
    deadline: '2h left',
    type: 'Non-Veg',
    img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&h=80&fit=crop&auto=format',
    status: 'available',
  },
  {
    id: 'F-200',
    name: 'Vegetable Pulao',
    donor: 'Sunrise Caterers',
    qty: '18 kg · ~60 servings',
    dist: '1.4 km',
    deadline: '4h left',
    type: 'Veg',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop&auto=format',
    status: 'available',
  },
  {
    id: 'F-199',
    name: 'Dal Tadka + Roti',
    donor: 'Community Kitchen',
    qty: '10 kg · ~35 servings',
    dist: '2.1 km',
    deadline: '1h left',
    type: 'Veg',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=80&h=80&fit=crop&auto=format',
    status: 'requested',
  },
]

const activeRequests = [
  { name: 'Idli Sambar', qty: '20 kg', donor: 'Arjun Sharma', status: 'in-transit', volunteer: 'Priya Nair', eta: '~15 min' },
  { name: 'Mixed Sweets', qty: '5 kg', donor: 'Mehta Sweets & Co.', status: 'accepted', volunteer: 'Assigning...', eta: 'TBD' },
]

export default function RecipientDashboard({ onNavigate }: RecipientDashboardProps) {
  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Top bar */}
      <div className="bg-[#1565C0] px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-xs">Good afternoon,</p>
            <h1 className="text-lg font-bold text-white font-poppins">Annapoorna Trust 🙏</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNavigate('notifications')} className="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
            <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-sm flex items-center justify-center font-poppins">
              A
            </button>
          </div>
        </div>
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              placeholder="Search food donations nearby..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/15 border border-white/20 rounded-xl text-sm text-white placeholder-white/60 focus:outline-none focus:bg-white/20"
            />
          </div>
          <button onClick={() => onNavigate('nearby')} className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </button>
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
              <p className="text-xs text-text-secondary">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Active requests */}
        {activeRequests.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-text-primary font-poppins mb-4">Active Requests</h2>
            <div className="space-y-3">
              {activeRequests.map((r, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    r.status === 'in-transit' ? 'bg-accent-50' : 'bg-[#E3F2FD]'
                  }`}>
                    {r.status === 'in-transit'
                      ? <TrendingUp className="w-5 h-5 text-accent" />
                      : <CheckCircle className="w-5 h-5 text-[#1565C0]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{r.name} · {r.qty}</p>
                    <p className="text-xs text-text-secondary mt-0.5">From {r.donor} · Volunteer: {r.volunteer}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      r.status === 'in-transit' ? 'bg-accent-50 text-accent' : 'bg-[#E3F2FD] text-[#1565C0]'
                    }`}>
                      {r.status === 'in-transit' ? `ETA ${r.eta}` : 'Accepted'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nearby food */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-text-primary font-poppins">Available Nearby</h2>
            <button onClick={() => onNavigate('nearby')} className="flex items-center gap-1 text-sm text-[#1565C0] font-semibold hover:underline">
              View map <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Map placeholder */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden mb-4 shadow-sm">
            <div className="relative h-44 bg-[#E8F5E9] flex items-center justify-center">
              <div className="absolute inset-0">
                {/* Simulated map grid */}
                <svg width="100%" height="100%" className="opacity-20">
                  <defs>
                    <pattern id="map-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2E7D32" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#map-grid)" />
                </svg>
                {/* Map pins */}
                {[
                  { top: '30%', left: '25%', color: '#2E7D32' },
                  { top: '55%', left: '50%', color: '#1565C0' },
                  { top: '40%', left: '70%', color: '#FF9800' },
                  { top: '65%', left: '35%', color: '#2E7D32' },
                ].map((pin, i) => (
                  <div
                    key={i}
                    className="absolute w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                    style={{ top: pin.top, left: pin.left, backgroundColor: pin.color, transform: 'translate(-50%, -50%)' }}
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                ))}
                {/* Current location */}
                <div className="absolute w-4 h-4 rounded-full bg-[#1565C0] border-2 border-white shadow-md" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                  <div className="absolute inset-0 rounded-full bg-[#1565C0] animate-ping opacity-50" />
                </div>
              </div>
              <button onClick={() => onNavigate('nearby')} className="relative bg-surface text-sm font-semibold text-text-primary px-4 py-2 rounded-xl border border-border shadow-md flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1565C0]" />
                View Full Map
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {nearbyFood.map((f) => (
              <div key={f.id} className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-bg border border-border">
                  <img src={f.img} alt={f.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text-primary">{f.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      f.type === 'Veg' ? 'bg-primary-50 text-primary' : 'bg-[#FFEBEE] text-[#B71C1C]'
                    }`}>
                      {f.type}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{f.donor} · {f.qty}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="w-3 h-3" />{f.dist}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-warning">
                      <Clock className="w-3 h-3" />{f.deadline}
                    </span>
                  </div>
                </div>
                <button
                  disabled={f.status === 'requested'}
                  className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-xl ${
                    f.status === 'requested'
                      ? 'bg-bg text-text-secondary border border-border'
                      : 'bg-[#1565C0] text-white shadow-sm hover:bg-[#0D47A1]'
                  }`}
                >
                  {f.status === 'requested' ? 'Requested' : 'Request'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
