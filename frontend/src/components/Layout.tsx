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

const userName: Record<Role, string> = {
  donor: 'Arjun Sharma',
  recipient: 'Annapoorna Trust',
  volunteer: 'Priya Nair',
  admin: 'Admin Console',
}

export default function Layout({ children, screen, role, onNavigate, notifCount = 3 }: LayoutProps) {
  const items = navItems[role]
  const colors = roleColors[role]

  return (
    <div className="flex min-h-screen bg-bg font-inter">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface/90 backdrop-blur-xl border-r border-border fixed top-0 left-0 h-screen z-20 shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <Logo size="md" variant="full" />
        </div>

        {/* User card + CheckIn Button */}
        <div className="px-4 py-3.5 border-b border-border space-y-2">
          <div
            className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-bg"
            onClick={() => onNavigate('profile')}
          >
            <div className={`w-9 h-9 rounded-full ${colors.bg} flex items-center justify-center text-white font-semibold text-sm font-poppins`}>
              {userName[role].charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{userName[role]}</p>
              <p className="text-xs text-text-secondary">{roleLabels[role]}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary" />
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg hover:text-text-primary"
          >
            <User className="w-5 h-5" />
            Profile
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg hover:text-text-primary"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-[#FEF2F2]"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-20 px-2 pt-2 pb-safe">
        <div className="flex items-center justify-around">
          {items.slice(0, 5).map((item) => {
            const active = screen === item.screen
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl flex-1 relative ${
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
