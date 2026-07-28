import { PlusCircle, Package, Clock, CheckCircle, XCircle, TrendingUp, MapPin, Bell, ChevronRight, Leaf, Users } from 'lucide-react'

type Screen = string
interface DonorDashboardProps {
  onNavigate: (screen: Screen) => void
}

const stats = [
  { label: 'Total Donations', value: '47', sub: '+3 this week', icon: Package, color: 'bg-primary-50 text-primary', trend: '+6%' },
  { label: 'Meals Provided', value: '1,240', sub: 'approx. servings', icon: Users, color: 'bg-accent-50 text-accent', trend: '+12%' },
  { label: 'Food Saved (kg)', value: '312', sub: 'from landfill', icon: Leaf, color: 'bg-[#E3F2FD] text-[#1565C0]', trend: '+8%' },
  { label: 'Active Donations', value: '3', sub: 'awaiting pickup', icon: Clock, color: 'bg-[#F3E5F5] text-[#6A1B9A]', trend: '' },
]

const recentDonations = [
  { id: 'D-1042', name: 'Vegetable Biryani', qty: '15 kg', status: 'delivered', recipient: 'Annapoorna Trust', time: '2h ago', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1041', name: 'Sambar & Rice', qty: '8 kg', status: 'in-transit', recipient: 'Hope Shelter', time: '4h ago', img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1040', name: 'Paneer Curry', qty: '6 kg', status: 'accepted', recipient: 'Green Hands NGO', time: '1d ago', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1039', name: 'Mixed Snacks Box', qty: '4 kg', status: 'pending', recipient: 'Matching...', time: '1d ago', img: 'https://images.unsplash.com/photo-1607920592519-bab2a80a0db2?w=80&h=80&fit=crop&auto=format' },
]

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  delivered: { label: 'Delivered', bg: 'bg-success/10', text: 'text-success', icon: CheckCircle },
  'in-transit': { label: 'In Transit', bg: 'bg-accent-50', text: 'text-accent', icon: TrendingUp },
  accepted: { label: 'Accepted', bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', icon: CheckCircle },
  pending: { label: 'Pending', bg: 'bg-[#F5F5F5]', text: 'text-text-secondary', icon: Clock },
  cancelled: { label: 'Cancelled', bg: 'bg-[#FFEBEE]', text: 'text-error', icon: XCircle },
}

const quickActions = [
  { label: 'Post Food', icon: PlusCircle, screen: 'post-donation', color: 'bg-primary text-white' },
  { label: 'Nearby NGOs', icon: MapPin, screen: 'nearby', color: 'bg-primary-50 text-primary' },
  { label: 'Notifications', icon: Bell, screen: 'notifications', color: 'bg-accent-50 text-accent' },
  { label: 'History', icon: Package, screen: 'history', color: 'bg-[#E3F2FD] text-[#1565C0]' },
]

export default function DonorDashboard({ onNavigate }: DonorDashboardProps) {
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
            {recentDonations.map((d, i) => {
              const sc = statusConfig[d.status]
              return (
                <div
                  key={d.id}
                  className={`flex items-center gap-4 p-4 hover:bg-bg cursor-pointer ${i < recentDonations.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-bg border border-border">
                    <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-primary truncate">{d.name}</p>
                      <span className="text-xs text-text-secondary hidden sm:block">· {d.qty}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{d.recipient} · {d.time}</p>
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
            })}
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
