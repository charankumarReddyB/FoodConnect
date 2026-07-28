import { ArrowLeft, Edit2, MapPin, Phone, Mail, Star, Package, Users, Leaf, ChevronRight, Settings, HelpCircle, LogOut, Shield } from 'lucide-react'

type Role = 'donor' | 'recipient' | 'volunteer' | 'admin'
interface ProfileProps {
  onBack: () => void
  role: Role
  onNavigate: (screen: string) => void
}

const profileData: Record<Role, { name: string; org: string; location: string; phone: string; email: string; avatar: string; bg: string; stats: { label: string; value: string }[] }> = {
  donor: {
    name: 'Arjun Sharma',
    org: 'Arjun\'s Catering Services',
    location: 'Bangalore, Karnataka',
    phone: '+91 98765 43210',
    email: 'arjun@example.com',
    avatar: 'A',
    bg: 'bg-primary',
    stats: [
      { label: 'Total Donations', value: '47' },
      { label: 'Meals Saved', value: '1,240' },
      { label: 'Food (kg)', value: '312' },
      { label: 'Impact Score', value: '9.4' },
    ],
  },
  recipient: {
    name: 'Annapoorna Trust',
    org: 'NGO · Since 2008',
    location: 'Bangalore, Karnataka',
    phone: '+91 80 2345 6789',
    email: 'contact@annapoorna.org',
    avatar: 'A',
    bg: 'bg-[#1565C0]',
    stats: [
      { label: 'Meals Received', value: '4,800' },
      { label: 'Beneficiaries', value: '350' },
      { label: 'Partners', value: '28' },
      { label: 'Rating', value: '4.9★' },
    ],
  },
  volunteer: {
    name: 'Priya Nair',
    org: 'FoodConnect Volunteer',
    location: 'Bangalore, Karnataka',
    phone: '+91 98123 45678',
    email: 'priya.nair@gmail.com',
    avatar: 'P',
    bg: 'bg-[#6A1B9A]',
    stats: [
      { label: 'Deliveries', value: '89' },
      { label: 'Km Covered', value: '342' },
      { label: 'Rating', value: '4.9★' },
      { label: 'Streak', value: '4 days' },
    ],
  },
  admin: {
    name: 'Admin Console',
    org: 'FoodConnect Operations',
    location: 'Bangalore, Karnataka',
    phone: '+91 80 1234 5678',
    email: 'admin@foodconnect.in',
    avatar: 'A',
    bg: 'bg-[#B71C1C]',
    stats: [
      { label: 'Users Managed', value: '8,240' },
      { label: 'Donations', value: '12,840' },
      { label: 'NGOs Verified', value: '284' },
      { label: 'Uptime', value: '99.8%' },
    ],
  },
}

const menuItems = [
  { icon: Edit2, label: 'Edit Profile', action: 'edit' },
  { icon: Shield, label: 'Privacy & Security', action: 'settings' },
  { icon: Settings, label: 'App Settings', action: 'settings' },
  { icon: HelpCircle, label: 'Help & Support', action: 'help' },
  { icon: Star, label: 'Rate FoodConnect', action: 'rate' },
]

const badges = [
  { emoji: '🏆', name: 'Top Donor', desc: 'Top 5% this month' },
  { emoji: '🌱', name: 'Green Hero', desc: '100+ kg saved' },
  { emoji: '⚡', name: 'Quick Poster', desc: 'Posts within 1hr' },
  { emoji: '❤️', name: 'Community Star', desc: '25+ donations' },
]

export default function Profile({ onBack, role, onNavigate }: ProfileProps) {
  const data = profileData[role]

  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Header */}
      <div className={`${data.bg} px-6 pt-5 pb-20 relative overflow-hidden`}>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute right-8 bottom-0 w-32 h-32 bg-white/10 rounded-full" />
        <div className="relative flex items-center justify-between mb-6">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Edit2 className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="relative flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-3xl font-bold font-poppins shadow-xl mb-3">
            {data.avatar}
          </div>
          <h1 className="text-xl font-bold text-white font-poppins">{data.name}</h1>
          <p className="text-white/70 text-sm">{data.org}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-white/60" />
            <span className="text-white/60 text-xs">{data.location}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 space-y-5 pb-8">
        {/* Stats card */}
        <div className="bg-surface rounded-2xl border border-border shadow-lg p-5">
          <div className="grid grid-cols-4 divide-x divide-border">
            {data.stats.map((s) => (
              <div key={s.label} className="text-center px-2">
                <p className="text-lg font-extrabold text-text-primary font-poppins">{s.value}</p>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-3">
          <h2 className="text-sm font-bold text-text-primary font-poppins">Contact Info</h2>
          {[
            { icon: Phone, value: data.phone },
            { icon: Mail, value: data.email },
            { icon: MapPin, value: data.location },
          ].map((item) => (
            <div key={item.value} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-text-secondary" />
              </div>
              <span className="text-sm text-text-primary">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        {role === 'donor' && (
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-text-primary font-poppins">Achievements</h2>
              <button className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                All badges <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {badges.map((b) => (
                <div key={b.name} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-2xl">
                    {b.emoji}
                  </div>
                  <p className="text-[10px] font-bold text-text-primary leading-tight">{b.name}</p>
                  <p className="text-[9px] text-text-secondary leading-tight">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact (donor) */}
        {role === 'donor' && (
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
            <h2 className="text-sm font-bold text-text-primary font-poppins mb-4">Environmental Impact</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Package, label: 'Food Saved', value: '312 kg', color: 'text-primary', bg: 'bg-primary-50' },
                { icon: Leaf, label: 'CO₂ Avoided', value: '156 kg', color: 'text-success', bg: 'bg-success/10' },
                { icon: Users, label: 'People Fed', value: '1,240', color: 'text-accent', bg: 'bg-accent-50' },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3`}>
                  <item.icon className={`w-5 h-5 mx-auto mb-1.5 ${item.color}`} />
                  <p className={`text-base font-bold font-poppins ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-text-secondary">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => item.action === 'settings' ? onNavigate('settings') : undefined}
              className={`w-full flex items-center gap-3 px-5 py-4 hover:bg-bg text-left ${
                i < menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-text-secondary" />
              </div>
              <span className="flex-1 text-sm font-medium text-text-primary">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={() => onNavigate('landing')}
          className="w-full flex items-center justify-center gap-2 bg-surface border border-error/20 text-error font-semibold py-3.5 rounded-2xl text-sm hover:bg-[#FEF2F2] shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
