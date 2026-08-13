import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Heart,
  Users,
  MapPin,
  Bell,
  History,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  Truck,
  BarChart3,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react'

import Logo from './Logo'
import CheckInButton from './CheckInButton'

type Screen =
  | 'landing'
  | 'onboarding'
  | 'role-select'
  | 'auth'
  | 'donor-dashboard'
  | 'recipient-dashboard'
  | 'volunteer-dashboard'
  | 'admin-dashboard'
  | 'post-donation'
  | 'nearby'
  | 'notifications'
  | 'profile'
  | 'history'
  | 'settings'

type Role = 'donor' | 'recipient' | 'volunteer' | 'admin'

interface LayoutProps {
  children: React.ReactNode
  screen: Screen
  role: Role
  onNavigate: (screen: Screen) => void
  notifCount?: number
}

const navItems: Record<Role, { icon: React.ElementType; label: string; screen: Screen }[]> = {
  donor: [
    { icon: LayoutDashboard, label: 'Dashboard', screen: 'donor-dashboard' },
    { icon: PlusCircle, label: 'Post Food', screen: 'post-donation' },
    { icon: Package, label: 'My Donations', screen: 'history' },
    { icon: MapPin, label: 'Nearby', screen: 'nearby' },
    { icon: Bell, label: 'Alerts', screen: 'notifications' },
  ],
  recipient: [
    { icon: LayoutDashboard, label: 'Dashboard', screen: 'recipient-dashboard' },
    { icon: MapPin, label: 'Browse Food', screen: 'nearby' },
    { icon: History, label: 'Requests', screen: 'history' },
    { icon: Bell, label: 'Alerts', screen: 'notifications' },
  ],
  volunteer: [
    { icon: LayoutDashboard, label: 'Dashboard', screen: 'volunteer-dashboard' },
    { icon: Truck, label: 'Deliveries', screen: 'nearby' },
    { icon: History, label: 'History', screen: 'history' },
    { icon: Bell, label: 'Alerts', screen: 'notifications' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', screen: 'admin-dashboard' },
    { icon: Users, label: 'Users', screen: 'history' },
    { icon: Heart, label: 'Donations', screen: 'nearby' },
    { icon: BarChart3, label: 'Reports', screen: 'notifications' },
    { icon: Settings, label: 'Settings', screen: 'settings' },
  ],
}

const roleColors: Record<Role, { bg: string; text: string; light: string }> = {
  donor: { bg: 'bg-gradient-primary', text: 'text-white', light: 'bg-emerald-50 text-emerald-800' },
  recipient: { bg: 'bg-gradient-to-r from-blue-600 to-indigo-600', text: 'text-white', light: 'bg-blue-50 text-blue-800' },
  volunteer: { bg: 'bg-gradient-to-r from-purple-600 to-indigo-600', text: 'text-white', light: 'bg-purple-50 text-purple-800' },
  admin: { bg: 'bg-gradient-to-r from-rose-600 to-red-600', text: 'text-white', light: 'bg-rose-50 text-rose-800' },
}

const roleLabels: Record<Role, string> = {
  donor: 'Food Donor',
  recipient: 'Recipient Org',
  volunteer: 'Volunteer',
  admin: 'Administrator',
}

const userNameDefaults: Record<Role, string> = {
  donor: 'Food Donor',
  recipient: 'Recipient Org',
  volunteer: 'Volunteer User',
  admin: 'Administrator',
}

export default function Layout({ children, screen, role, onNavigate, notifCount = 3 }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('foodconnect_user')
      return raw ? JSON.parse(raw) : null
    } catch (_) {
      return null
    }
  })

  useEffect(() => {
    const syncUser = () => {
      try {
        const raw = localStorage.getItem('foodconnect_user')
        if (raw) {
          setCurrentUser(JSON.parse(raw))
        }
      } catch (_) {}
    }

    syncUser()
    window.addEventListener('storage', syncUser)
    window.addEventListener('focus', syncUser)
    const timer = setInterval(syncUser, 1000)

    return () => {
      window.removeEventListener('storage', syncUser)
      window.removeEventListener('focus', syncUser)
      clearInterval(timer)
    }
  }, [])

  const normalizedRole: Role = (role && String(role).toLowerCase() in navItems)
    ? (String(role).toLowerCase() as Role)
    : 'donor'
  const items = navItems[normalizedRole] || navItems.donor
  const colors = roleColors[normalizedRole] || roleColors.donor

  const displayName = currentUser?.fullName || currentUser?.name || userNameDefaults[normalizedRole] || 'FoodConnect User'
  const displayRoleLabel = roleLabels[normalizedRole] || 'FoodConnect Member'
  const initialChar = displayName.charAt(0).toUpperCase()
  const profileImage = currentUser?.profileImageUrl || currentUser?.photoUrl || ''

  return (
    <div className="flex min-h-screen bg-bg font-inter w-full max-w-full overflow-x-hidden">
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-md border-b border-border z-30 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl text-text-primary hover:bg-bg cursor-pointer transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Logo size="sm" variant="full" />
        </div>

        <div className="flex items-center gap-2">
          <CheckInButton variant="header" />
          <button
            onClick={() => onNavigate('profile')}
            className={`w-9 h-9 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden shrink-0 cursor-pointer`}
          >
            {profileImage ? (
              <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initialChar
            )}
          </button>
        </div>
      </header>

      {/* Mobile Side Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-surface h-full shadow-2xl flex flex-col z-10 animate-slide-in-left">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Logo size="sm" variant="full" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-bg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <div
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg cursor-pointer transition-all"
                onClick={() => {
                  onNavigate('profile')
                  setMobileMenuOpen(false)
                }}
              >
                {profileImage ? (
                  <img src={profileImage} alt={displayName} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shrink-0" />
                ) : (
                  <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold text-sm font-poppins shrink-0 shadow-sm`}>
                    {initialChar}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate font-poppins">{displayName}</p>
                  <p className="text-xs text-text-secondary truncate">{displayRoleLabel}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary shrink-0" />
              </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {items.map((item) => {
                const active = screen === item.screen
                return (
                  <button
                    key={item.screen}
                    onClick={() => {
                      onNavigate(item.screen)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      active
                        ? `${colors.bg} ${colors.text} shadow-sm`
                        : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                    {item.screen === 'notifications' && notifCount > 0 && (
                      <span className="ml-auto bg-accent text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {notifCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border space-y-1">
              <button
                onClick={() => {
                  onNavigate('profile')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg cursor-pointer"
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              <button
                onClick={() => {
                  onNavigate('settings')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg cursor-pointer"
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('foodconnect_user')
                  localStorage.removeItem('foodconnect_token')
                  onNavigate('landing')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface/90 backdrop-blur-xl border-r border-border fixed top-0 left-0 h-screen z-20 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <Logo size="md" variant="full" />
        </div>

        {/* Dynamic User card + CheckIn Button */}
        <div className="px-4 py-3.5 border-b border-border space-y-2">
          <div
            className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-bg/80 transition-all border border-transparent hover:border-border"
            onClick={() => onNavigate('profile')}
          >
            {profileImage ? (
              <img src={profileImage} alt={displayName} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 shrink-0" />
            ) : (
              <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-white font-bold text-sm font-poppins shrink-0 shadow-sm`}>
                {initialChar}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate font-poppins">{displayName}</p>
              <p className="text-xs text-text-secondary truncate">{displayRoleLabel}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary shrink-0" />
          </div>
          <div className="pt-1">
            <CheckInButton variant="header" className="w-full justify-center" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const active = screen === item.screen
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? `${colors.bg} ${colors.text} shadow-sm`
                    : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {item.screen === 'notifications' && notifCount > 0 && (
                  <span className="ml-auto bg-accent text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-6 space-y-1 border-t border-border pt-3">
          <button
            onClick={() => onNavigate('profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg hover:text-text-primary cursor-pointer"
          >
            <User className="w-5 h-5" />
            Profile
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg hover:text-text-primary cursor-pointer"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('foodconnect_user')
              localStorage.removeItem('foodconnect_token')
              onNavigate('landing')
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-[#FEF2F2] cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content with Mobile Top Header Spacing */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-24 lg:pb-0 min-h-screen overflow-x-hidden w-full max-w-full">
        {children}
      </main>

      {/* Bottom Nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border z-30 px-2 pt-2 pb-safe shadow-lg">
        <div className="flex items-center justify-around">
          {items.slice(0, 5).map((item) => {
            const active = screen === item.screen
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl flex-1 relative cursor-pointer ${
                  active ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                <div className="relative">
                  <item.icon className="w-6 h-6" />
                  {item.screen === 'notifications' && notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {notifCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
