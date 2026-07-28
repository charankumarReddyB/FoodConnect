import { useState } from 'react'
import { ArrowLeft, Camera, MapPin, Clock, Users, Leaf, Package, ChevronDown, CheckCircle } from 'lucide-react'

interface PostDonationProps {
  onBack: () => void
  onSuccess: () => void
}

const categories = ['Cooked Meal', 'Baked Goods', 'Fruits & Vegetables', 'Packaged Food', 'Beverages', 'Dairy', 'Grains & Pulses']

const foodImages = [
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=200&h=200&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop&auto=format',
]

export default function PostDonation({ onBack, onSuccess }: PostDonationProps) {
  const [foodType, setFoodType] = useState<'veg' | 'nonveg'>('veg')
  const [delivery, setDelivery] = useState<'pickup' | 'volunteer'>('volunteer')
  const [category, setCategory] = useState('Cooked Meal')
  const [submitted, setSubmitted] = useState(false)
  const [selectedImg, setSelectedImg] = useState(0)

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 font-inter">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary font-poppins mb-3">Donation Posted!</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-2">
            Your donation has been published. Nearby recipients have been notified.
          </p>
          <div className="bg-surface rounded-2xl border border-border p-4 mt-6 mb-8 text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-border flex-shrink-0">
                <img src={foodImages[selectedImg]} alt="Food" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Vegetable Biryani</p>
                <p className="text-xs text-text-secondary mt-0.5">15 kg · 50 servings · Veg</p>
                <p className="text-xs text-primary font-medium mt-0.5">ID: D-{Math.floor(Math.random() * 9000) + 1000}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onSuccess}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg hover:bg-primary-dark"
          >
            Back to Dashboard
          </button>
          <button onClick={onBack} className="w-full text-text-secondary text-sm font-medium mt-3 py-2">
            Post Another Donation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center hover:bg-border">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div>
          <h1 className="text-base font-bold text-text-primary font-poppins">Post Donation</h1>
          <p className="text-xs text-text-secondary">Share your surplus food</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 space-y-6 pb-24">
        {/* Food photos */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <h2 className="text-sm font-bold text-text-primary font-poppins mb-3">Food Photos</h2>
          <div className="flex gap-3">
            {foodImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImg(i)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                  selectedImg === i ? 'border-primary' : 'border-border'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                {selectedImg === i && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ))}
            <button className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary-50 text-text-secondary hover:text-primary flex-shrink-0">
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-medium">Add</span>
            </button>
          </div>
        </div>

        {/* Food details */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-text-primary font-poppins">Food Details</h2>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Food Name</label>
            <input
              type="text"
              defaultValue="Vegetable Biryani"
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Veg / Non-Veg */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Food Type</label>
            <div className="flex gap-3">
              {(['veg', 'nonveg'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFoodType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    foodType === t
                      ? t === 'veg' ? 'border-primary bg-primary-50 text-primary' : 'border-[#B71C1C] bg-[#FFEBEE] text-[#B71C1C]'
                      : 'border-border text-text-secondary'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${
                    t === 'veg' ? 'border-primary' : 'border-[#B71C1C]'
                  }`}>
                    {foodType === t && <span className={`w-1.5 h-1.5 rounded-full ${t === 'veg' ? 'bg-primary' : 'bg-[#B71C1C]'}`} />}
                  </span>
                  {t === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              defaultValue="Freshly prepared vegetable biryani with raita. Made with basmati rice, seasonal vegetables, and mild spices. Suitable for all ages."
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                <Package className="w-3.5 h-3.5 inline mr-1" />Quantity (kg)
              </label>
              <input
                type="number"
                defaultValue="15"
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                <Users className="w-3.5 h-3.5 inline mr-1" />Servings
              </label>
              <input
                type="number"
                defaultValue="50"
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Time & pickup */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-text-primary font-poppins">Pickup Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                <Leaf className="w-3.5 h-3.5 inline mr-1" />Prepared At
              </label>
              <input
                type="time"
                defaultValue="12:30"
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 inline mr-1" />Pickup Deadline
              </label>
              <input
                type="time"
                defaultValue="15:00"
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />Pickup Address
            </label>
            <input
              type="text"
              defaultValue="No. 42, MG Road, Bangalore - 560001"
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          {/* Map placeholder */}
          <div className="relative h-32 bg-primary-50 rounded-xl overflow-hidden border border-primary-100">
            <svg width="100%" height="100%" className="opacity-30">
              <defs>
                <pattern id="map-grid-2" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2E7D32" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#map-grid-2)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-surface rounded-xl px-4 py-2 shadow-md border border-border flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-text-primary">MG Road, Bangalore</span>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md">
              <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
            </div>
          </div>
        </div>

        {/* Delivery preference */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <h2 className="text-sm font-bold text-text-primary font-poppins mb-3">Delivery Preference</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'volunteer' as const, label: 'Volunteer Delivery', desc: 'A nearby volunteer picks up and delivers', icon: '🚴' },
              { key: 'pickup' as const, label: 'Recipient Pickup', desc: 'The recipient collects food directly', icon: '🏢' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDelivery(opt.key)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  delivery === opt.key
                    ? 'border-primary bg-primary-50'
                    : 'border-border hover:border-primary-100'
                }`}
              >
                <span className="text-2xl mb-2 block">{opt.icon}</span>
                <p className={`text-xs font-bold mb-1 ${delivery === opt.key ? 'text-primary' : 'text-text-primary'}`}>{opt.label}</p>
                <p className="text-[11px] text-text-secondary leading-tight">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-surface border-t border-border px-6 py-4">
        <button
          onClick={() => setSubmitted(true)}
          className="w-full max-w-2xl mx-auto block bg-primary text-white font-bold py-4 rounded-2xl text-sm shadow-lg hover:bg-primary-dark"
        >
          Publish Donation
        </button>
      </div>
    </div>
  )
}
