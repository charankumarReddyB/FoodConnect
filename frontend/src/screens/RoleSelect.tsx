import { Heart, Building2, Bike, ShieldCheck, ArrowRight } from 'lucide-react'
import Logo from '../components/Logo'

type Role = 'donor' | 'recipient' | 'volunteer' | 'admin'

interface RoleSelectProps {
  onSelect: (role: Role) => void
}

const roles = [
  {
    id: 'donor' as Role,
    icon: Heart,
    title: 'Food Donor',
    desc: 'Restaurants, caterers, households, and event organizers with surplus food.',
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    border: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
    text: 'text-emerald-600',
    tag: 'Restaurants · Households · Events',
  },
  {
    id: 'recipient' as Role,
    icon: Building2,
    title: 'Recipient Org',
    desc: 'Orphanages, old-age homes, shelters, NGOs, and community kitchens seeking food.',
    color: 'bg-blue-600',
    lightBg: 'bg-blue-50',
    border: 'hover:border-blue-600 hover:shadow-blue-600/10',
    text: 'text-blue-600',
    tag: 'NGOs · Shelters · Orphanages',
  },
  {
    id: 'volunteer' as Role,
    icon: Bike,
    title: 'Volunteer',
    desc: 'Community members who pick up and deliver food on their own schedule.',
    color: 'bg-purple-600',
    lightBg: 'bg-purple-50',
    border: 'hover:border-purple-600 hover:shadow-purple-600/10',
    text: 'text-purple-600',
    tag: 'Students · Professionals · Retirees',
  },
  {
    id: 'admin' as Role,
    icon: ShieldCheck,
    title: 'Administrator',
    desc: 'Platform admins who manage users, verify NGOs, and monitor system health.',
    color: 'bg-rose-600',
    lightBg: 'bg-rose-50',
    border: 'hover:border-rose-600 hover:shadow-rose-600/10',
    text: 'text-rose-600',
    tag: 'Team Accounts Only',
  },
]

export default function RoleSelect({ onSelect }: RoleSelectProps) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12 font-inter bg-gradient-hero">
      <div className="w-full max-w-2xl animate-scale-in">
        {/* Header */}
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size="lg" variant="full" className="mb-6" />
          <h1 className="text-3xl font-extrabold text-slate-900 font-poppins mb-3">How do you want to help?</h1>
          <p className="text-slate-500 text-base max-w-md">Select your role to get a tailored food-saving dashboard experience.</p>
        </div>

        {/* Roles */}
        <div className="grid sm:grid-cols-2 gap-4">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`group bg-surface/90 backdrop-blur-md rounded-3xl border border-slate-200 ${r.border} p-6 text-left shadow-sm card-hover btn-press cursor-pointer relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${r.lightBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <r.icon className={`w-6 h-6 ${r.text}`} />
                </div>
                <ArrowRight className={`w-5 h-5 ${r.text} opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-poppins mb-1.5">{r.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{r.desc}</p>
              <span className={`inline-block text-xs font-semibold ${r.text} ${r.lightBg} px-3 py-1 rounded-full`}>
                {r.tag}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 mt-8 font-medium">
          Already have an account?{' '}
          <button className="text-emerald-600 font-bold hover:underline cursor-pointer" onClick={() => onSelect('donor')}>
            Sign in here
          </button>
        </p>
      </div>
    </div>
  )
}
