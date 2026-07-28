import { ArrowLeft, Package, CheckCircle, Clock, XCircle, TrendingUp, Filter, ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'

type Role = 'donor' | 'recipient' | 'volunteer' | 'admin'
interface HistoryProps {
  onBack: () => void
  role: Role
}

const donationHistory = [
  { id: 'D-1042', name: 'Vegetable Biryani', qty: '15 kg', recipient: 'Annapoorna Trust', date: 'Jul 28, 2025', status: 'delivered', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1041', name: 'Sambar & Rice', qty: '8 kg', recipient: 'Hope Shelter', date: 'Jul 27, 2025', status: 'delivered', img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1040', name: 'Paneer Curry', qty: '6 kg', recipient: 'Green Hands NGO', date: 'Jul 26, 2025', status: 'delivered', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1039', name: 'Mixed Snacks Box', qty: '4 kg', recipient: 'N/A', date: 'Jul 25, 2025', status: 'expired', img: 'https://images.unsplash.com/photo-1607920592519-bab2a80a0db2?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1038', name: 'Chicken Biriyani', qty: '20 kg', recipient: 'Bethany Shelter', date: 'Jul 24, 2025', status: 'delivered', img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1037', name: 'Pav Bhaji', qty: '12 kg', recipient: 'Sunrise NGO', date: 'Jul 23, 2025', status: 'delivered', img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1036', name: 'Dal Fry + Chapati', qty: '9 kg', recipient: 'Community Kitchen', date: 'Jul 22, 2025', status: 'delivered', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=80&h=80&fit=crop&auto=format' },
  { id: 'D-1035', name: 'Chole Bhature', qty: '7 kg', recipient: 'N/A', date: 'Jul 20, 2025', status: 'cancelled', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=80&h=80&fit=crop&auto=format' },
]

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  delivered: { label: 'Delivered', bg: 'bg-success/10', text: 'text-success', icon: CheckCircle },
  'in-transit': { label: 'In Transit', bg: 'bg-accent-50', text: 'text-accent', icon: TrendingUp },
  pending: { label: 'Pending', bg: 'bg-[#F5F5F5]', text: 'text-text-secondary', icon: Clock },
  expired: { label: 'Expired', bg: 'bg-warning/10', text: 'text-warning', icon: Clock },
  cancelled: { label: 'Cancelled', bg: 'bg-[#FFEBEE]', text: 'text-error', icon: XCircle },
}

export default function History({ onBack }: HistoryProps) {
  const [filter, setFilter] = useState<'all' | 'delivered' | 'pending' | 'cancelled'>('all')
  const [query, setQuery] = useState('')

  const filtered = donationHistory.filter((d) => {
    const matchStatus = filter === 'all' || d.status === filter
    const matchQuery = d.name.toLowerCase().includes(query.toLowerCase()) || d.recipient.toLowerCase().includes(query.toLowerCase())
    return matchStatus && matchQuery
  })

  const deliveredCount = donationHistory.filter((d) => d.status === 'delivered').length

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
            <p className="text-xs text-text-secondary">{donationHistory.length} total · {deliveredCount} delivered</p>
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-surface border-b border-border px-4 py-2 flex gap-2">
        {(['all', 'delivered', 'pending', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f ? 'bg-primary text-white' : 'bg-bg text-text-secondary border border-border'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 p-4 max-w-2xl mx-auto">
        {[
          { label: 'Delivered', value: deliveredCount, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Total kg', value: '312', color: 'text-primary', bg: 'bg-primary-50' },
          { label: 'Meals', value: '1,240', color: 'text-accent', bg: 'bg-accent-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-xl font-extrabold font-poppins ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
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
            const sc = statusConfig[d.status]
            return (
              <div key={d.id} className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4 shadow-sm hover:shadow-md cursor-pointer">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{d.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{d.recipient} · {d.qty}</p>
                  <p className="text-xs text-text-secondary">{d.date}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                    <sc.icon className="w-3.5 h-3.5" />
                    {sc.label}
                  </span>
                  <span className={`sm:hidden w-2 h-2 rounded-full ${d.status === 'delivered' ? 'bg-success' : d.status === 'expired' ? 'bg-warning' : 'bg-error'}`} />
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
