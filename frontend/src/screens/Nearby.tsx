import { ArrowLeft, MapPin, Filter, Clock, Search, X, Navigation } from 'lucide-react'
import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

interface NearbyProps {
  onBack: () => void
  role: string
}

interface FoodItem {
  id: string
  name: string
  donor: string
  qty: string
  dist: string
  time: string
  type: 'Veg' | 'Non-Veg'
  lat: number
  lng: number
  img: string
}

const foodItems: FoodItem[] = [
  { 
    id: 'F-201', 
    name: 'Paneer Butter Masala + Butter Naan', 
    donor: 'Saravana Bhavan, Indiranagar', 
    qty: '25 kg', 
    dist: '0.8 km', 
    time: '2h left', 
    type: 'Veg', 
    lat: 12.9784, 
    lng: 77.6408, 
    img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=120&h=120&fit=crop&auto=format' 
  },
  { 
    id: 'F-200', 
    name: 'Hyderabadi Veg Dum Biryani', 
    donor: 'Royal Hyderabad Caterers, Koramangala', 
    qty: '18 kg', 
    dist: '1.4 km', 
    time: '4h left', 
    type: 'Veg', 
    lat: 12.9352, 
    lng: 77.6245, 
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&h=120&fit=crop&auto=format' 
  },
  { 
    id: 'F-199', 
    name: 'Dal Tadka + Chapati', 
    donor: 'Annapoorna Community Kitchen, MG Road', 
    qty: '10 kg', 
    dist: '2.1 km', 
    time: '1h left', 
    type: 'Veg', 
    lat: 12.9756, 
    lng: 77.6066, 
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&h=120&fit=crop&auto=format' 
  },
  { 
    id: 'F-198', 
    name: 'Special Pav Bhaji Batch', 
    donor: 'Mumbai Express, HSR Layout', 
    qty: '8 kg', 
    dist: '3.2 km', 
    time: '3h left', 
    type: 'Veg', 
    lat: 12.9121, 
    lng: 77.6445, 
    img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=120&h=120&fit=crop&auto=format' 
  },
  { 
    id: 'F-197', 
    name: 'Chicken Chettinad + Parotta', 
    donor: 'Chettinad Mess, BTM Layout', 
    qty: '12 kg', 
    dist: '2.7 km', 
    time: '5h left', 
    type: 'Non-Veg', 
    lat: 12.9166, 
    lng: 77.6101, 
    img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=120&h=120&fit=crop&auto=format' 
  },
]

// Custom Leaflet DivIcon for markers
const createCustomIcon = (type: 'Veg' | 'Non-Veg', isSelected: boolean) => {
  const color = type === 'Veg' ? '#22C55E' : '#EF4444'
  const scale = isSelected ? 'transform: scale(1.25); z-index: 1000;' : ''
  
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; ${scale}">
        <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  })
}

export default function Nearby({ onBack }: NearbyProps) {
  const [filter, setFilter] = useState<'all' | 'veg' | 'nonveg'>('all')
  const [selected, setSelected] = useState<string | null>('F-201')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = foodItems.filter((f) => {
    const matchesFilter = filter === 'all' || (filter === 'veg' && f.type === 'Veg') || (filter === 'nonveg' && f.type === 'Non-Veg')
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.donor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const selectedItem = foodItems.find((f) => f.id === selected)
  const center: [number, number] = [12.9600, 77.6250] // Center between Bengaluru spots

  return (
    <div className="h-screen bg-bg font-inter flex flex-col">
      {/* Top Header */}
      <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0 z-20 shadow-sm">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center hover:bg-border/50">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nearby food, location..."
            className="w-full pl-9 pr-4 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
            showFilters ? 'bg-primary border-primary text-white' : 'bg-bg border-border text-text-secondary'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Chips */}
      {showFilters && (
        <div className="bg-surface border-b border-border px-4 py-2.5 flex items-center gap-2 flex-shrink-0 z-20">
          {(['all', 'veg', 'nonveg'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                filter === f ? 'bg-primary text-white border-primary' : 'bg-bg text-text-secondary border-border hover:bg-border/50'
              }`}
            >
              {f === 'all' ? 'All Food' : f === 'veg' ? 'Veg Only 🟢' : 'Non-Veg 🔴'}
            </button>
          ))}
        </div>
      )}

      {/* Real Interactive Leaflet Map */}
      <div className="relative flex-1 z-10 overflow-hidden">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filtered.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createCustomIcon(item.type, selected === item.id)}
              eventHandlers={{
                click: () => setSelected(item.id),
              }}
            >
              <Popup className="foodconnect-popup">
                <div className="p-1 max-w-[200px]">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white mb-1 ${item.type === 'Veg' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {item.type}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 leading-snug">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.donor}</p>
                  <p className="text-[11px] font-semibold text-emerald-700 mt-1">{item.qty} • {item.dist} away</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* GPS Re-center Floating Action Button */}
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                alert(`Located at Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
              });
            }
          }}
          className="absolute bottom-4 right-4 z-20 w-11 h-11 bg-surface border border-border rounded-full shadow-lg flex items-center justify-center text-primary hover:bg-bg transition-transform active:scale-95"
          title="Locate Current Position"
        >
          <Navigation className="w-5 h-5 fill-primary/20" />
        </button>
      </div>

      {/* Selected Item Details Footer Drawer */}
      {selectedItem && (
        <div className="bg-surface border-t border-border p-4 flex-shrink-0 z-20 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <img src={selectedItem.img} alt={selectedItem.name} className="w-16 h-16 rounded-xl object-cover border border-border shadow-sm" />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${selectedItem.type === 'Veg' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <h3 className="font-bold text-text-primary text-sm leading-tight">{selectedItem.name}</h3>
                </div>
                <p className="text-xs text-text-secondary mt-1">{selectedItem.donor}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1 font-medium text-primary"><MapPin className="w-3 h-3" />{selectedItem.dist} away</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />{selectedItem.time}</span>
                  <span className="font-semibold text-text-primary">{selectedItem.qty} available</span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-bg">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <button className="w-full py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2">
            <span>Request Food Donation</span>
          </button>
        </div>
      )}
    </div>
  )
}
