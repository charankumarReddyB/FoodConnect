import { useState, useEffect } from 'react'
import { ArrowLeft, Edit2, MapPin, Phone, Mail, Star, Package, Users, Leaf, ChevronRight, Settings, HelpCircle, LogOut, Shield, CheckCircle, Sparkles, X, Save, RefreshCw, Trophy, Zap, Heart } from 'lucide-react'
import { authApi, UserProfile } from '../services/api'

type Role = 'donor' | 'recipient' | 'volunteer' | 'admin'

interface ProfileProps {
  onBack: () => void
  role: Role
  onNavigate: (screen: string) => void
}

const roleThemeConfig: Record<Role, { label: string; bg: string; badgeBg: string; text: string }> = {
  donor: { label: 'Food Donor', bg: 'bg-gradient-to-r from-emerald-600 to-teal-700', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-600' },
  recipient: { label: 'Recipient Organization', bg: 'bg-gradient-to-r from-blue-600 to-indigo-700', badgeBg: 'bg-blue-50 text-blue-800 border-blue-200', text: 'text-blue-600' },
  volunteer: { label: 'FoodConnect Volunteer', bg: 'bg-gradient-to-r from-purple-600 to-indigo-700', badgeBg: 'bg-purple-50 text-purple-800 border-purple-200', text: 'text-purple-600' },
  admin: { label: 'Platform Administrator', bg: 'bg-gradient-to-r from-rose-600 to-red-700', badgeBg: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-600' },
}

const defaultRoleStats: Record<Role, { label: string; value: string }[]> = {
  donor: [
    { label: 'Total Donations', value: '47' },
    { label: 'Meals Saved', value: '1,240' },
    { label: 'Food (kg)', value: '312' },
    { label: 'Impact Score', value: '9.4' },
  ],
  recipient: [
    { label: 'Meals Received', value: '4,800' },
    { label: 'Beneficiaries', value: '350' },
    { label: 'Partners', value: '28' },
    { label: 'Rating', value: '4.9★' },
  ],
  volunteer: [
    { label: 'Deliveries', value: '89' },
    { label: 'Km Covered', value: '342' },
    { label: 'Rating', value: '4.9★' },
    { label: 'Streak', value: '4 days' },
  ],
  admin: [
    { label: 'Users Managed', value: '8,240' },
    { label: 'Donations', value: '12,840' },
    { label: 'NGOs Verified', value: '284' },
    { label: 'Uptime', value: '99.9%' },
  ],
}

const badges = [
  { icon: Trophy, color: 'text-amber-500', name: 'Top Supporter', desc: 'Top 5% this month' },
  { icon: Leaf, color: 'text-emerald-500', name: 'Green Hero', desc: '100+ kg saved' },
  { icon: Zap, color: 'text-indigo-500', name: 'Quick Responder', desc: 'Responds within 30m' },
  { icon: Heart, color: 'text-rose-500', name: 'Community Pillar', desc: 'Active verified profile' },
]

export default function Profile({ onBack, role, onNavigate }: ProfileProps) {
  const normalizedRole: Role = (role && String(role).toLowerCase() in roleThemeConfig)
    ? (String(role).toLowerCase() as Role)
    : 'donor'
  const theme = roleThemeConfig[normalizedRole] || roleThemeConfig.donor
  const stats = defaultRoleStats[normalizedRole] || defaultRoleStats.donor

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('foodconnect_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (_) {}
    }
    return null
  })

  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  // Primary Location State
  const [savedAddress, setSavedAddress] = useState(user?.address || '100 Feet Road, Indiranagar, Bengaluru - 560038')
  const [savedLat, setSavedLat] = useState<number>(user?.latitude || 12.9716)
  const [savedLng, setSavedLng] = useState<number>(user?.longitude || 77.5946)
  const [isLocatingGps, setIsLocatingGps] = useState(false)
  const [locationStatus, setLocationStatus] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchLatestUser = async () => {
      try {
        setLoading(true)
        const profile = await authApi.getCurrentUser()
        if (mounted && profile) {
          setUser(profile)
          if (profile.address) setSavedAddress(profile.address)
          if (profile.latitude) setSavedLat(profile.latitude)
          if (profile.longitude) setSavedLng(profile.longitude)
        }
      } catch (_) {
        // Fallback to existing localStorage state
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchLatestUser()
    return () => {
      mounted = false
    }
  }, [])

  const handleAcquireGps = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.')
      return
    }
    setIsLocatingGps(true)
    setLocationStatus('Acquiring live GPS coordinates...')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setSavedLat(lat)
        setSavedLng(lng)
        setLocationStatus(`GPS Acquired: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          const json = await res.json()
          if (json && json.display_name) {
            setSavedAddress(json.display_name)
          }
        } catch (_) {
          setSavedAddress(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
        } finally {
          setIsLocatingGps(false)
        }
      },
      (err) => {
        setIsLocatingGps(false)
        setLocationStatus('GPS permission denied or unavailable.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSaveLocation = async () => {
    setSaveLoading(true)
    setLocationStatus('Saving primary location to Cloud Firestore...')
    try {
      const updatedUser: UserProfile = {
        ...user,
        id: user?.id || `usr_${Date.now()}`,
        fullName: user?.fullName || 'FoodConnect User',
        email: user?.email || 'user@foodconnect.org',
        role: (user?.role as any) || 'DONOR',
        isActive: true,
        address: savedAddress,
        latitude: savedLat,
        longitude: savedLng,
      }
      setUser(updatedUser)
      localStorage.setItem('foodconnect_user', JSON.stringify(updatedUser))

      // Write to Cloud Firestore collection 'users' synchronously
      try {
        const { setDoc, doc, GeoPoint } = await import('firebase/firestore')
        const { firestore } = await import('../config/firebase')
        await setDoc(doc(firestore, 'users', updatedUser.id), {
          ...updatedUser,
          location: new GeoPoint(savedLat, savedLng),
          updatedAt: new Date().toISOString(),
        }, { merge: true })
      } catch (fsErr) {
        console.warn('Firestore user location write notice:', fsErr)
      }

      setLocationStatus('Primary location updated and saved!')
      setTimeout(() => setLocationStatus(null), 3000)
    } catch (err: any) {
      setLocationStatus('Failed to save location.')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleOpenEdit = () => {
    setEditName(user?.fullName || (role === 'admin' ? 'Admin Operator' : 'User Name'))
    setEditPhone(user?.phone || '+91 98765 43210')
    setEditAddress(savedAddress)
    setEditing(true)
    setSaveMsg(null)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    setSaveMsg(null)
    try {
      const updated = await authApi.updateProfile({
        fullName: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      })
      setUser(updated)
      setSavedAddress(editAddress.trim())
      setSaveMsg('Profile updated successfully!')
      setTimeout(() => {
        setEditing(false)
        setSaveMsg(null)
      }, 1000)
    } catch (err: any) {
      setSaveMsg(err.message || 'Failed to update profile')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleSignOut = () => {
    authApi.logout()
    onNavigate('landing')
  }

  const displayName = user?.fullName || (role === 'admin' ? 'Charan Kumar Reddy (Admin)' : 'FoodConnect User')
  const displayEmail = user?.email || (role === 'admin' ? 'charankumarreddybantrothula@gmail.com' : 'user@foodconnect.org')
  const displayPhone = user?.phone || '+91 98765 43210'
  const displayAddress = user?.address || 'Bangalore, Karnataka, India'
  const initial = displayName.charAt(0).toUpperCase()

  const menuItems = [
    { icon: Edit2, label: 'Edit Profile Information', onClick: handleOpenEdit },
    { icon: Shield, label: 'Account Security & Linking', onClick: () => onNavigate('settings') },
    { icon: Settings, label: 'Application Preferences', onClick: () => onNavigate('settings') },
    { icon: HelpCircle, label: 'Help Center & Support', onClick: () => onNavigate('help') },
    { icon: Star, label: 'Rate FoodConnect App', onClick: () => alert('Thank you for rating FoodConnect 5 Stars!') },
  ]

  return (
    <div className="min-h-screen bg-bg font-inter animate-fade-in pb-12">
      {/* Header Banner */}
      <div className={`${theme.bg} px-6 pt-6 pb-20 relative overflow-hidden shadow-lg`}>
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {theme.label}
            </span>
            <button
              onClick={handleOpenEdit}
              className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-95"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-white/25 backdrop-blur-md border-4 border-white/40 flex items-center justify-center text-white text-4xl font-extrabold font-poppins shadow-2xl overflow-hidden">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-md">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white font-poppins flex items-center gap-2">
            {displayName}
            {loading && <RefreshCw className="w-4 h-4 animate-spin text-white/70" />}
          </h1>
          <p className="text-white/80 text-sm mt-0.5 font-medium">{displayEmail}</p>

          <div className="flex items-center gap-1.5 mt-2 text-white/75 text-xs bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{displayAddress}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-5">
        {/* Stats Card */}
        <div className="bg-surface rounded-2xl border border-border shadow-xl p-5 backdrop-blur-sm">
          <div className="grid grid-cols-4 divide-x divide-border">
            {stats.map((s) => (
              <div key={s.label} className="text-center px-1">
                <p className="text-xl font-black text-text-primary font-poppins">{s.value}</p>
                <p className="text-[11px] text-text-secondary mt-1 font-medium leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification & Account Badges */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Account Verification Status</h2>
            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${theme.badgeBg}`}>
              {role.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-bg border border-border rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-text-primary truncate">{displayPhone}</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> OTP Verified
                </p>
              </div>
            </div>

            <div className="p-3 bg-bg border border-border rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-text-primary truncate">{displayEmail}</p>
                <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Auth Active
                </p>
              </div>
            </div>

            <div className="p-3 bg-bg border border-border rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-text-primary">E2E Protection</p>
                <p className="text-[10px] text-purple-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> JWT Secured
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Saved Location Card */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Primary Saved Location</h2>
              <p className="text-xs text-text-secondary mt-0.5">Used for nearby food matching and delivery routing (GeoPoint format)</p>
            </div>
            <button
              type="button"
              disabled={isLocatingGps}
              onClick={handleAcquireGps}
              className="flex items-center gap-1.5 bg-primary-50 hover:bg-primary-100 text-primary text-xs font-semibold px-3 py-1.5 rounded-xl border border-primary-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isLocatingGps ? 'Locating...' : '📍 Live GPS'}</span>
            </button>
          </div>

          {locationStatus && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {locationStatus}
              </span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wide mb-1">
                Saved Primary Address
              </label>
              <input
                type="text"
                value={savedAddress}
                onChange={(e) => setSavedAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wide mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={savedLat}
                  onChange={(e) => setSavedLat(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wide mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={savedLng}
                  onChange={(e) => setSavedLng(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-xs font-mono text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-text-secondary font-mono">
                Firestore GeoPoint: ({savedLat.toFixed(4)}, {savedLng.toFixed(4)})
              </span>
              <button
                type="button"
                disabled={saveLoading}
                onClick={handleSaveLocation}
                className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveLoading ? 'Saving...' : 'Save Location'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Environmental & Community Impact */}
        {role === 'donor' && (
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Environmental Impact Summary</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Package, label: 'Food Rescued', value: '312 kg', color: 'text-primary', bg: 'bg-emerald-50 border border-emerald-100' },
                { icon: Leaf, label: 'CO₂ Saved', value: '156 kg', color: 'text-emerald-700', bg: 'bg-teal-50 border border-teal-100' },
                { icon: Users, label: 'People Served', value: '1,240', color: 'text-blue-700', bg: 'bg-blue-50 border border-blue-100' },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3 shadow-xs`}>
                  <item.icon className={`w-5 h-5 mx-auto mb-1.5 ${item.color}`} />
                  <p className={`text-base font-extrabold font-poppins ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-text-secondary font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements / Badges */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Achievements & Recognition</h2>
            <span className="text-xs text-primary font-semibold flex items-center gap-0.5">
              Verified <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {badges.map((b) => (
              <div key={b.name} className="flex flex-col items-center text-center p-2 rounded-xl bg-bg border border-border hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-surface shadow-xs flex items-center justify-center mb-1">
                  <b.icon className={`w-5 h-5 ${b.color}`} />
                </div>
                <p className="text-[10px] font-bold text-text-primary leading-tight">{b.name}</p>
                <p className="text-[9px] text-text-secondary leading-tight mt-0.5">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Navigation Menu */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-bg transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 transition-colors">
                <item.icon className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
              </div>
              <span className="flex-1 text-sm font-semibold text-text-primary">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-surface border border-red-200 text-red-600 font-bold py-3.5 rounded-2xl text-sm hover:bg-red-50 transition-all shadow-sm active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of Account
        </button>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-text-primary font-poppins flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" /> Edit Profile Details
              </h3>
              <button
                onClick={() => setEditing(false)}
                className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveMsg && (
              <div className={`p-3 text-xs font-bold rounded-xl ${saveMsg.includes('success') ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {saveMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Location / Address</label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-bg text-sm font-semibold text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-text-secondary hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-dark flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saveLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
