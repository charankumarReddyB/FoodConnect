import { useState, useEffect } from 'react'

import Landing from './screens/Landing'
import Onboarding from './screens/Onboarding'
import RoleSelect from './screens/RoleSelect'
import Auth from './screens/Auth'
import DonorDashboard from './screens/DonorDashboard'
import RecipientDashboard from './screens/RecipientDashboard'
import VolunteerDashboard from './screens/VolunteerDashboard'
import AdminDashboard from './screens/AdminDashboard'
import PostDonation from './screens/PostDonation'
import Nearby from './screens/Nearby'
import Notifications from './screens/Notifications'
import Profile from './screens/Profile'
import History from './screens/History'
import Settings from './screens/Settings'
import Layout from './components/Layout'
import SplashScreen from './components/SplashScreen'

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

const dashboardForRole: Record<Role, Screen> = {
  donor: 'donor-dashboard',
  recipient: 'recipient-dashboard',
  volunteer: 'volunteer-dashboard',
  admin: 'admin-dashboard',
}

const AUTHED_SCREENS: Screen[] = [
  'donor-dashboard',
  'recipient-dashboard',
  'volunteer-dashboard',
  'admin-dashboard',
  'post-donation',
  'nearby',
  'notifications',
  'profile',
  'history',
  'settings',
]

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [screen, setScreen] = useState<Screen>('landing')
  const [role, setRole] = useState<Role>('donor')

  useEffect(() => {
    const savedToken = localStorage.getItem('foodconnect_token')
    const savedUserRaw = localStorage.getItem('foodconnect_user')
    if (savedToken && savedUserRaw) {
      try {
        const user = JSON.parse(savedUserRaw)
        let matchedRole: Role = 'donor'
        if (user.role === 'NGO' || user.role === 'ORPHANAGE' || user.role === 'OLD_AGE_HOME' || user.role === 'SHELTER') {
          matchedRole = 'recipient'
        } else if (user.role === 'VOLUNTEER') {
          matchedRole = 'volunteer'
        } else if (user.role === 'ADMIN') {
          matchedRole = 'admin'
        }
        setRole(matchedRole)
        setScreen(dashboardForRole[matchedRole])
      } catch (_) {}
    }
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  const isAuthed = AUTHED_SCREENS.includes(screen)

  const handleRoleSelect = (r: Role) => {
    setRole(r)
    setScreen('auth')
  }

  const handleAuthSuccess = () => {
    const savedUserRaw = localStorage.getItem('foodconnect_user')
    if (savedUserRaw) {
      try {
        const user = JSON.parse(savedUserRaw)
        let matchedRole: Role = role || 'donor'
        if (user.role === 'NGO' || user.role === 'ORPHANAGE' || user.role === 'OLD_AGE_HOME' || user.role === 'SHELTER' || user.role === 'RECIPIENT') {
          matchedRole = 'recipient'
        } else if (user.role === 'VOLUNTEER') {
          matchedRole = 'volunteer'
        } else if (user.role === 'ADMIN') {
          matchedRole = 'admin'
        } else if (user.role === 'DONOR') {
          matchedRole = 'donor'
        }
        setRole(matchedRole)
        const targetScreen = dashboardForRole[matchedRole] || 'donor-dashboard'
        setScreen(targetScreen)
        return
      } catch (_) {}
    }
    const targetScreen = dashboardForRole[role] || 'donor-dashboard'
    setScreen(targetScreen)
  }

  const handleLogout = () => {
    localStorage.removeItem('foodconnect_token')
    localStorage.removeItem('foodconnect_refresh_token')
    localStorage.removeItem('foodconnect_user')
    setScreen('landing')
  }

  const navigate = (s: string) => {
    if (s === 'landing' || s === 'logout') {
      handleLogout()
    } else {
      setScreen(s as Screen)
    }
  }

  // Auth screens — no layout shell
  if (!isAuthed) {
    switch (screen) {
      case 'landing':
        return (
          <Landing
            onGetStarted={() => setScreen('onboarding')}
            onLogin={() => setScreen('role-select')}
          />
        )
      case 'onboarding':
        return <Onboarding onFinish={() => setScreen('role-select')} />
      case 'role-select':
        return <RoleSelect onSelect={handleRoleSelect} />
      case 'auth':
        return (
          <Auth
            role={role}
            onSuccess={handleAuthSuccess}
            onBack={() => setScreen('role-select')}
          />
        )
      default:
        return <Landing onGetStarted={() => setScreen('onboarding')} onLogin={() => setScreen('role-select')} />
    }
  }

  // Screens that render without the persistent Layout shell
  if (screen === 'post-donation') {
    return (
      <PostDonation
        onBack={() => setScreen(dashboardForRole[role])}
        onSuccess={() => setScreen(dashboardForRole[role])}
      />
    )
  }

  if (screen === 'nearby') {
    return (
      <Nearby
        onBack={() => setScreen(dashboardForRole[role])}
        role={role}
      />
    )
  }

  // Screens with Layout shell
  const renderMain = () => {
    switch (screen) {
      case 'donor-dashboard':
        return <DonorDashboard onNavigate={navigate} />
      case 'recipient-dashboard':
        return <RecipientDashboard onNavigate={navigate} />
      case 'volunteer-dashboard':
        return <VolunteerDashboard onNavigate={navigate} />
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigate} />
      case 'notifications':
        return <Notifications onBack={() => setScreen(dashboardForRole[role])} />
      case 'profile':
        return <Profile onBack={() => setScreen(dashboardForRole[role])} role={role} onNavigate={navigate} />
      case 'history':
        return <History onBack={() => setScreen(dashboardForRole[role])} role={role} />
      case 'settings':
        return <Settings onBack={() => setScreen(dashboardForRole[role])} />
      default:
        return <DonorDashboard onNavigate={navigate} />
    }
  }

  return (
    <Layout screen={screen} role={role} onNavigate={navigate} notifCount={3}>
      {renderMain()}
    </Layout>
  )
}
