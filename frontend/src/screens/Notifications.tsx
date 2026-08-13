import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Bell, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { firestore } from '../config/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { getLocalNotifications, AppNotification } from '../services/notificationService'

interface NotificationsProps {
  onBack: () => void
}

const defaultNotifications: AppNotification[] = [
  {
    id: 'd1',
    type: 'delivery',
    title: 'Food In Transit',
    body: 'Priya Nair has picked up your Vegetable Biryani donation and is on the way to Annapoorna Trust.',
    time: '5 min ago',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'd2',
    type: 'accepted',
    title: 'Donation Accepted',
    body: 'Annapoorna Trust has accepted your Sambar & Rice donation. Expected pickup in 45 minutes.',
    time: '1h ago',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: 'd3',
    type: 'request',
    title: 'New Food Request',
    body: 'Hope Children Home has requested your Paneer Curry donation. Tap to review and accept.',
    time: '2h ago',
    timestamp: new Date().toISOString(),
    read: false,
  },
]

const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
  delivery: { icon: Truck, color: 'text-accent', bg: 'bg-accent-50' },
  accepted: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  request: { icon: Bell, color: 'text-[#1565C0]', bg: 'bg-[#E3F2FD]' },
  completed: { icon: Heart, color: 'text-primary', bg: 'bg-primary-50' },
  warning: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
  package: { icon: Package, color: 'text-[#6A1B9A]', bg: 'bg-[#F3E5F5]' },
}

export default function Notifications({ onBack }: NotificationsProps) {
  const [notifs, setNotifs] = useState<AppNotification[]>(() => {
    const local = getLocalNotifications()
    return local.length > 0 ? local : defaultNotifications
  })

  useEffect(() => {
    // Subscribe to Firestore 'notifications' collection
    const unsubscribe = onSnapshot(
      collection(firestore, 'notifications'),
      (snapshot) => {
        const liveList: AppNotification[] = []
        snapshot.forEach((document) => {
          const data = document.data()
          liveList.push({
            id: document.id,
            type: data.type || 'package',
            title: data.title || 'FoodConnect Update',
            body: data.body || '',
            time: data.time || 'Just now',
            timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
            read: !!data.read,
          })
        })
        if (liveList.length > 0) {
          const local = getLocalNotifications()
          const combined = [...liveList, ...local.filter((l) => !liveList.some((liv) => liv.id === l.id))]
          setNotifs(combined)
        }
      },
      (err) => {
        console.warn('Firestore notifications query warning:', err)
      }
    )

    return () => unsubscribe()
  }, [])

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifs.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center hover:bg-border transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-text-primary font-poppins">Live Notifications</h1>
          {unreadCount > 0 && <p className="text-xs text-text-secondary">{unreadCount} unread update{unreadCount > 1 ? 's' : ''}</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold text-primary hover:underline">
            Mark all read
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-2.5">
        {notifs.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center text-text-secondary text-sm">
            No notifications yet. Updates will appear here when food is posted, requested, or delivered!
          </div>
        ) : (
          notifs.map((n) => {
            const style = iconMap[n.type] || iconMap.package
            const Icon = style.icon
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                  n.read ? 'bg-surface border-border' : 'bg-surface border-primary-200 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                  <Icon className={`w-5 h-5 ${style.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-text-primary leading-snug">
                      {n.title}
                    </p>
                    <span className="text-[10px] font-semibold text-text-secondary flex-shrink-0 mt-0.5">{n.time}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{n.body}</p>
                </div>
                {!n.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1.5 animate-pulse" />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
