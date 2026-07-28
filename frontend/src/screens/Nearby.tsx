import { ArrowLeft, MapPin, Filter, Clock, Search, X } from 'lucide-react'
import { useState } from 'react'

interface NearbyProps {
  onBack: () => void
  role: string
}

const foodItems = [
  { id: 'F-201', name: 'Paneer Butter Masala + Butter Naan', donor: 'Saravana Bhavan, Indiranagar', qty: '25 kg', dist: '0.8 km', time: '2h left', type: 'Veg', lat: 38, lng: 28, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=80&h=80&fit=crop&auto=format' },
  { id: 'F-200', name: 'Hyderabadi Veg Dum Biryani', donor: 'Royal Hyderabad Caterers, Koramangala', qty: '18 kg', dist: '1.4 km', time: '4h left', type: 'Veg', lat: 55, lng: 52, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop&auto=format' },
  { id: 'F-199', name: 'Dal Tadka + Chapati', donor: 'Annapoorna Community Kitchen, MG Road', qty: '10 kg', dist: '2.1 km', time: '1h left', type: 'Veg', lat: 42, lng: 68, img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=80&h=80&fit=crop&auto=format' },
  { id: 'F-198', name: 'Special Pav Bhaji Batch', donor: 'Mumbai Express, HSR Layout', qty: '8 kg', dist: '3.2 km', time: '3h left', type: 'Veg', lat: 70, lng: 35, img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=80&h=80&fit=crop&auto=format' },
  { id: 'F-197', name: 'Chicken Chettinad + Parotta', donor: 'Chettinad Mess, BTM Layout', qty: '12 kg', dist: '2.7 km', time: '5h left', type: 'Non-Veg', lat: 25, lng: 62, img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=80&h=80&fit=crop&auto=format' },
]

const mapPinColors = ['#2E7D32', '#1565C0', '#FF9800', '#6A1B9A', '#B71C1C']

export default function Nearby({ onBack }: NearbyProps) {
  const [filter, setFilter] = useState<'all' | 'veg' | 'nonveg'>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = foodItems.filter((f) => {
    if (filter === 'veg') return f.type === 'Veg'
    if (filter === 'nonveg') return f.type === 'Non-Veg'
    return true
  })

  const selectedItem = foodItems.find((f) => f.id === selected)

  return (
    <div className="h-screen bg-bg font-inter flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search Indian food donations nearby (Indiranagar, Koramangala)..."
            className="w-full pl-9 pr-4 py-2.5 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${showFilters ? 'bg-primary border-primary' : 'bg-bg border-border'}`}
        >
          <Filter className={`w-4 h-4 ${showFilters ? 'text-white' : 'text-text-secondary'}`} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-2 flex-shrink-0">
          {(['all', 'veg', 'nonveg'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize ${
                filter === f ? 'bg-primary text-white border-primary' : 'bg-bg text-text-secondary border-border'
              }`}
            >
              {f === 'all' ? 'All Indian Food' : f === 'veg' ? 'Veg Only 🟢' : 'Non-Veg 🔴'}
            </button>
          ))}
        </div>
      )}

      {/* Interactive Map Area */}
      <div className="relative flex-1 bg-[#1E251E] overflow-hidden">
        {/* Map Grid Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#2E7D32_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Map Markers */}
        {filtered.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setSelected(item.id)}
            style={{ top: `${item.lat}%`, left: `${item.lng}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 ${
              selected === item.id ? 'scale-125 z-20' : 'z-10 hover:scale-110'
            }`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
              style={{ backgroundColor: mapPinColors[idx % mapPinColors.length] }}
            >
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-surface border border-border px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap text-text-primary shadow-md">
              {item.name} ({item.qty})
            </div>
          </button>
        ))}

        {/* User Location Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-primary/30 animate-ping absolute" />
          <div className="w-4 h-4 rounded-full bg-primary border-2 border-white relative shadow-lg" />
        </div>
      </div>

      {/* Selection Drawer */}
      {selectedItem && (
        <div className="bg-surface border-t border-border p-4 flex-shrink-0 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <img src={selectedItem.img} alt={selectedItem.name} className="w-14 h-14 rounded-xl object-cover border border-border" />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${selectedItem.type === 'Veg' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <h3 className="font-semibold text-text-primary text-sm">{selectedItem.name}</h3>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{selectedItem.donor}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{selectedItem.dist} away</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />{selectedItem.time}</span>
                  <span className="font-medium text-text-primary">{selectedItem.qty} available</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-bg">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <button className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
            Request Food Donation
          </button>
        </div>
      )}
    </div>
  )
}
