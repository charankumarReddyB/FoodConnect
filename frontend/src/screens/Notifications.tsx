import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Bell, Heart } from 'lucide-react'

interface NotificationsProps {
  onBack: () => void
}

const notifications = [
  {
    id: 1,
    type: 'delivery',
    icon: Truck,
    color: 'text-accent',
    bg: 'bg-accent-50',
    title: 'Food In Transit',
    body: 'Priya Nair has picked up your Vegetable Biryani donation and is on the way to Annapoorna Trust.',
    time: '5 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'accepted',
    icon: CheckCircle,
    color: 'text-success',
    bg: 'bg-success/10',
    title: 'Donation Accepted',
    body: 'Annapoorna Trust has accepted your Sambar & Rice donation. Expected pickup in 45 minutes.',
    time: '1h ago',
    read: false,
  },
  {
    id: 3,
    type: 'request',
    icon: Bell,
    color: 'text-[#1565C0]',
    bg: 'bg-[#E3F2FD]',
    title: 'New Food Request',
    body: 'Hope Children Home has requested your Paneer Curry donation. Tap to review and accept.',
    time: '2h ago',
    read: false,
  },
  {
    id: 4,
    type: 'completed',
    icon: Heart,
    color: 'text-primary',
    bg: 'bg-primary-50',
    title: 'Donation Completed 🎉',
    body: 'Your Chicken Biriyani reached 45 children at Green Hands NGO. Thank you for making a difference!',
    time: '5h ago',
    read: true,
  },
  {
    id: 5,
    type: 'warning',
    icon: AlertCircle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    title: 'Pickup Deadline Approaching',
    body: 'Your Mixed Snacks Box donation expires in 1 hour. No recipient has responded yet.',
    time: '8h ago',
    read: true,
  },
  {
    id: 6,
    type: 'package',
    icon: Package,
    color: 'text-[#6A1B9A]',
    bg: 'bg-[#F3E5F5]',
    title: 'Volunteer Assigned',
    body: 'Rajesh Kumar (⭐ 4.8) has been assigned to deliver your Dal Rice to Hope Shelter.',
    time: '1d ago',
    read: true,
  },
  {
    id: 7,
    type: 'completed',
    icon: Heart,
    color: 'text-primary',
    bg: 'bg-primary-50',
    title: 'Monthly Milestone',
    body: "You've donated 15 times this month! You're in the top 5% of donors on FoodConnect.",
    time: '2d ago',
    read: true,
  },
]

export default function Notifications({ onBack }: NotificationsProps) {
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-text-primary font-poppins">Notifications</h1>
          {unread > 0 && <p className="text-xs text-text-secondary">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button className="text-xs font-semibold text-primary hover:underline">
            Mark all read
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer hover:shadow-sm ${
              n.read ? 'bg-surface border-border' : 'bg-surface border-primary-100 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.bg}`}>
              <n.icon className={`w-5 h-5 ${n.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${n.read ? 'text-text-primary' : 'text-text-primary'}`}>
                  {n.title}
                </p>
                <span className="text-[10px] text-text-secondary flex-shrink-0 mt-0.5">{n.time}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">{n.body}</p>
            </div>
            {!n.read && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
