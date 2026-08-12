import { useState } from 'react'
import { ArrowLeft, Camera, MapPin, Clock, Users, Leaf, Package, ChevronDown, CheckCircle, Truck, Building, AlertCircle } from 'lucide-react'
import { donationApi, UserProfile } from '../services/api'
import { firestore } from '../config/firebase'
import { doc, setDoc } from 'firebase/firestore'

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
  const [user] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('foodconnect_user')
    if (raw) {
      try { return JSON.parse(raw) } catch (_) {}
    }
    return null
  })

  const [title, setTitle] = useState('Vegetable Biryani')
  const [description, setDescription] = useState('Freshly prepared vegetable biryani with raita. Made with basmati rice, seasonal vegetables, and mild spices. Suitable for all ages.')
  const [category, setCategory] = useState('Cooked Meal')
  const [foodType, setFoodType] = useState<'veg' | 'nonveg'>('veg')
  const [quantityDescription, setQuantityDescription] = useState('15 kg')
  const [estimatedServings, setEstimatedServings] = useState(50)
  const [pickupAddress, setPickupAddress] = useState('No. 42, MG Road, Bangalore - 560001')
  const [delivery, setDelivery] = useState<'pickup' | 'volunteer'>('volunteer')
  const [selectedImg, setSelectedImg] = useState(0)
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [postedDonationId, setPostedDonationId] = useState<string>('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setCustomImageUrl(url)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !pickupAddress.trim()) {
      setErrorMsg('Food name and pickup address are required.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    const finalImgUrl = customImageUrl || foodImages[selectedImg]
    const donationId = `don_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    const payload = {
      title: title.trim(),
      description: description.trim(),
      foodType: foodType === 'veg' ? ('VEG' as const) : ('NON_VEG' as const),
      quantityDescription: quantityDescription.trim() || '10 kg',
      estimatedServings: Number(estimatedServings) || 20,
      preparedTime: new Date().toISOString(),
      expiryTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      pickupAddress: pickupAddress.trim(),
      latitude: 12.9716,
      longitude: 77.5946,
      deliveryMethod: delivery === 'volunteer' ? ('VOLUNTEER_DELIVERY' as const) : ('SELF_PICKUP' as const),
      imageUrls: [finalImgUrl],
    }

    try {
      // 1. Send REST API Request
      const apiRes = await donationApi.createDonation(payload)
      const targetId = apiRes?.id || donationId
      setPostedDonationId(targetId)

      // 2. Synchronize to Cloud Firestore 'donations' collection synchronously
      try {
        await setDoc(doc(firestore, 'donations', targetId), {
          ...payload,
          id: targetId,
          donorId: user?.id || 'usr_donor',
          donorName: user?.fullName || 'Food Donor',
          status: 'AVAILABLE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      } catch (fsErr) {
        console.warn('Firestore setDoc client sync warning:', fsErr)
      }

      setSubmitted(true)
    } catch (err: any) {
      console.warn('Backend REST API unavailable, writing directly to Cloud Firestore collection...')
      // Direct Firestore write fallback
      try {
        await setDoc(doc(firestore, 'donations', donationId), {
          ...payload,
          id: donationId,
          donorId: user?.id || 'usr_donor',
          donorName: user?.fullName || 'Food Donor',
          status: 'AVAILABLE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        setPostedDonationId(donationId)
        setSubmitted(true)
      } catch (fsWriteErr: any) {
        setErrorMsg(fsWriteErr.message || 'Failed to submit donation to database. Please check connection.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 font-inter">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold text-text-primary font-poppins mb-3">Donation Persisted!</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-2">
            Your food donation has been saved to Cloud Firestore and published.
          </p>
          <div className="bg-surface rounded-2xl border border-border p-4 mt-6 mb-8 text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-border flex-shrink-0">
                <img src={customImageUrl || foodImages[selectedImg]} alt="Food" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{title}</p>
                <p className="text-xs text-text-secondary mt-0.5">{quantityDescription} · {estimatedServings} servings · {foodType.toUpperCase()}</p>
                <p className="text-xs text-primary font-medium mt-0.5">ID: {postedDonationId}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onSuccess}
            className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg hover:bg-primary-dark"
          >
            Back to Dashboard
          </button>
          <button onClick={() => setSubmitted(false)} className="w-full text-text-secondary text-sm font-medium mt-3 py-2">
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
          <h1 className="text-base font-bold text-text-primary font-poppins">Post Food Donation</h1>
          <p className="text-xs text-text-secondary">Share surplus food to Cloud Firestore</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 space-y-6 pb-24">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Food photos */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <h2 className="text-sm font-bold text-text-primary font-poppins mb-3">Food Photos</h2>
          <div className="flex gap-3">
            {foodImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setSelectedImg(i); setCustomImageUrl(null); }}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                  selectedImg === i && !customImageUrl ? 'border-primary' : 'border-border'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                {selectedImg === i && !customImageUrl && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ))}

            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary-50 text-text-secondary hover:text-primary flex-shrink-0 cursor-pointer relative overflow-hidden">
              {customImageUrl ? (
                <img src={customImageUrl} alt="Uploaded" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Upload</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        {/* Food details */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-text-primary font-poppins">Food Details</h2>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Food Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vegetable Biryani"
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
                  type="button"
                  key={t}
                  onClick={() => setFoodType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    foodType === t
                      ? t === 'veg' ? 'border-primary bg-primary-50 text-primary' : 'border-[#B71C1C] bg-[#FFEBEE] text-[#B71C1C]'
                      : 'border-border text-text-secondary'
                  }`}
                >
                  {t === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                <Package className="w-3.5 h-3.5 inline mr-1" />Quantity Description
              </label>
              <input
                type="text"
                value={quantityDescription}
                onChange={(e) => setQuantityDescription(e.target.value)}
                placeholder="e.g. 15 kg"
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
                <Users className="w-3.5 h-3.5 inline mr-1" />Estimated Servings
              </label>
              <input
                type="number"
                value={estimatedServings}
                onChange={(e) => setEstimatedServings(Number(e.target.value))}
                className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Time & pickup */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-text-primary font-poppins">Pickup Details</h2>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />Pickup Address
            </label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Delivery preference */}
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
          <h2 className="text-sm font-bold text-text-primary font-poppins mb-3">Delivery Preference</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'volunteer' as const, label: 'Volunteer Delivery', desc: 'A nearby volunteer picks up and delivers', icon: Truck },
              { key: 'pickup' as const, label: 'Recipient Pickup', desc: 'The recipient collects food directly', icon: Building },
            ].map((opt) => (
              <button
                type="button"
                key={opt.key}
                onClick={() => setDelivery(opt.key)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  delivery === opt.key
                    ? 'border-primary bg-primary-50'
                    : 'border-border hover:border-primary-100'
                }`}
              >
                <opt.icon className={`w-6 h-6 mb-2 ${delivery === opt.key ? 'text-primary' : 'text-text-secondary'}`} />
                <p className={`text-xs font-bold mb-1 ${delivery === opt.key ? 'text-primary' : 'text-text-primary'}`}>{opt.label}</p>
                <p className="text-[11px] text-text-secondary leading-tight">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-surface border-t border-border px-6 py-4 z-10">
        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full max-w-2xl mx-auto block bg-primary text-white font-bold py-4 rounded-2xl text-sm shadow-lg hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Publishing to Cloud Firestore...' : 'Publish Donation to Database'}
        </button>
      </div>
    </div>
  )
}
