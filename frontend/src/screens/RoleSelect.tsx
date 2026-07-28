import { Heart, Building2, Bike, ShieldCheck, ArrowRight } from 'lucide-react'

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
    color: 'bg-primary',
    lightBg: 'bg-primary-50',
    border: 'border-primary-100 hover:border-primary',
    text: 'text-primary',
    tag: 'Restaurants · Households · Events',
  },
  {
    id: 'recipient' as Role,
    icon: Building2,
    title: 'Recipient Org',
    desc: 'Orphanages, old-age homes, shelters, NGOs, and community kitchens seeking food.',
    color: 'bg-[#1565C0]',
    lightBg: 'bg-[#E3F2FD]',
    border: 'border-[#BBDEFB] hover:border-[#1565C0]',
    text: 'text-[#1565C0]',
    tag: 'NGOs · Shelters · Orphanages',
  },
  {
    id: 'volunteer' as Role,
    icon: Bike,
    title: 'Volunteer',
    desc: 'Community members who pick up and deliver food on their own schedule.',
    color: 'bg-[#6A1B9A]',
    lightBg: 'bg-[#F3E5F5]',
    border: 'border-[#E1BEE7] hover:border-[#6A1B9A]',
    text: 'text-[#6A1B9A]',
    tag: 'Students · Professionals · Retirees',
  },
  {
    id: 'admin' as Role,
    icon: ShieldCheck,
    title: 'Administrator',
    desc: 'Platform admins who manage users, verify NGOs, and monitor system health.',
    color: 'bg-[#B71C1C]',
    lightBg: 'bg-[#FFEBEE]',
    border: 'border-[#FFCDD2] hover:border-[#B71C1C]',
    text: 'text-[#B71C1C]',
    tag: 'Team Accounts Only',
  },
]

export default function RoleSelect({ onSelect }: RoleSelectProps) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12 font-inter">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary font-poppins mb-3">How do you want to help?</h1>
          <p className="text-text-secondary text-base">Choose your role to get a personalised experience.</p>
        </div>

        {/* Roles */}
        <div className="grid sm:grid-cols-2 gap-4">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id)}
              className={`group bg-surface rounded-2xl border-2 ${r.border} p-6 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${r.lightBg} flex items-center justify-center`}>
                  <r.icon className={`w-6 h-6 ${r.text}`} />
                </div>
                <ArrowRight className={`w-5 h-5 ${r.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <h3 className="text-base font-bold text-text-primary font-poppins mb-1.5">{r.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">{r.desc}</p>
              <span className={`inline-block text-xs font-medium ${r.text} ${r.lightBg} px-2.5 py-1 rounded-full`}>
                {r.tag}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-text-secondary mt-8">
          Already have an account?{' '}
          <button className="text-primary font-semibold hover:underline" onClick={() => onSelect('donor')}>
            Sign in here
          </button>
        </p>
      </div>
    </div>
  )
}
