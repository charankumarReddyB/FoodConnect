import { ArrowLeft, Bell, MapPin, Lock, Moon, Globe, Trash2, ChevronRight, Shield, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '../i18n/i18nContext'
import LanguageModal from '../i18n/LanguageModal'

interface SettingsProps {
  onBack: () => void
}

export default function Settings({ onBack }: SettingsProps) {
  const { t, languageInfo } = useTranslation()
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [notifDonations, setNotifDonations] = useState(true)
  const [notifDeliveries, setNotifDeliveries] = useState(true)
  const [notifAlerts, setNotifAlerts] = useState(false)
  const [locationOn, setLocationOn] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${on ? 'bg-emerald-600' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
    </button>
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">{title}</h2>
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  )

  const Row = ({
    icon: Icon,
    label,
    desc,
    right,
    onClick,
    iconBg = 'bg-slate-50 border-slate-200',
  }: {
    icon: React.ElementType
    label: string
    desc?: string
    right: React.ReactNode
    onClick?: () => void
    iconBg?: string
  }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      {right}
    </div>
  )

  return (
    <div className="min-h-screen bg-bg font-inter animate-fade-in">
      <div className="bg-surface border-b border-border px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center cursor-pointer hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5 text-slate-900" />
        </button>
        <h1 className="text-base font-bold text-slate-900 font-poppins">{t('settings')}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Section title="Appearance & Language">
          <Row
            icon={Globe}
            label={t('language')}
            desc={`${languageInfo.flag} ${languageInfo.nativeName} (${languageInfo.name})`}
            onClick={() => setIsLangOpen(true)}
            right={
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {languageInfo.nativeName}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            }
          />
          <Row icon={Moon} label="Dark Mode" desc="Reduces eye strain at night" right={<Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />} />
        </Section>

        <Section title="Notifications">
          <Row icon={Bell} label="Donation Alerts" desc="When someone requests your donation" right={<Toggle on={notifDonations} onToggle={() => setNotifDonations(!notifDonations)} />} />
          <Row icon={Bell} label="Delivery Updates" desc="Real-time delivery status" right={<Toggle on={notifDeliveries} onToggle={() => setNotifDeliveries(!notifDeliveries)} />} />
          <Row icon={Bell} label="Promotional" desc="Tips, news, and community stories" right={<Toggle on={notifAlerts} onToggle={() => setNotifAlerts(!notifAlerts)} />} />
        </Section>

        <Section title="Privacy & Location">
          <Row icon={MapPin} label="Location Services" desc="Required for nearby matching" right={<Toggle on={locationOn} onToggle={() => setLocationOn(!locationOn)} />} />
          <Row icon={Shield} label="Profile Visibility" desc="Public to donors and NGOs" right={<ChevronRight className="w-4 h-4 text-slate-400" />} />
          <Row icon={Lock} label="Change Password" right={<ChevronRight className="w-4 h-4 text-slate-400" />} />
        </Section>

        <Section title="Account">
          <Row icon={Smartphone} label="Connected Devices" desc="1 device signed in" right={<ChevronRight className="w-4 h-4 text-slate-400" />} />
          <Row icon={Trash2} label="Delete Account" desc="Permanently remove your data" right={<ChevronRight className="w-4 h-4 text-rose-500" />} iconBg="bg-rose-50 border-rose-200" />
        </Section>

        <div className="text-center py-4">
          <p className="text-xs text-slate-400">FoodConnect v2.4.1</p>
          <p className="text-xs text-slate-400 mt-0.5">© 2026 FoodConnect. Built for India</p>
        </div>
      </div>

      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </div>
  )
}
