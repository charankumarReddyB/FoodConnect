import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Bell, Heart, ChevronRight, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { firestore } from '../config/firebase'
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore'
import { getLocalNotifications, AppNotification } from '../services/notificationService'
import { DonationItem, donationApi } from '../services/api'
import DonationDetailsModal from '../components/DonationDetailsModal'
import RequestReviewModal, { FoodRequestItem } from '../components/RequestReviewModal'

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
  const [currentUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('foodconnect_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [notifs, setNotifs] = useState<AppNotification[]>(() => {
    const local = getLocalNotifications()
    return local.length > 0 ? local : defaultNotifications
  })

  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<FoodRequestItem | null>(null)
  const [isOpening, setIsOpening] = useState<boolean>(false)

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
            donationId: data.donationId,
            requestId: data.requestId,
            recipientId: data.recipientId,
            recipientName: data.recipientName,
            donorId: data.donorId,
            donorName: data.donorName,
            foodTitle: data.foodTitle,
            action: data.action,
            userId: data.userId,
          })
        })

        // Sort notifications by timestamp descending (newest first)
        liveList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

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
    setNotifs((prev) =>
      prev.map((n) => {
        if (!n.read) {
          try {
            updateDoc(doc(firestore, 'notifications', n.id), { read: true })
          } catch (_) {}
        }
        return { ...n, read: true }
      })
    )
    try {
      const local = getLocalNotifications().map((n) => ({ ...n, read: true }))
      localStorage.setItem('foodconnect_notifications', JSON.stringify(local))
    } catch (_) {}
  }

  const handleNotificationClick = async (notif: AppNotification) => {
    // 1. Mark as read
    if (!notif.read) {
      setNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
      try {
        updateDoc(doc(firestore, 'notifications', notif.id), { read: true })
      } catch (_) {}
      try {
        const local = getLocalNotifications().map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        localStorage.setItem('foodconnect_notifications', JSON.stringify(local))
      } catch (_) {}
    }

    if (!notif.donationId && !notif.requestId) return

    setIsOpening(true)
    try {
      let donationData: DonationItem | null = null
      let requestData: FoodRequestItem | null = null

      // Fetch donation document
      if (notif.donationId) {
        try {
          const donSnap = await getDoc(doc(firestore, 'donations', notif.donationId))
          if (donSnap.exists()) {
            donationData = { id: donSnap.id, ...(donSnap.data() as any) }
          }
        } catch (_) {}

        if (!donationData) {
          // Fallback to local storage or API
          const localRaw = localStorage.getItem('foodconnect_local_donations')
          if (localRaw) {
            try {
              const list: DonationItem[] = JSON.parse(localRaw)
              donationData = list.find((d) => d.id === notif.donationId) || null
            } catch (_) {}
          }
        }

        if (!donationData) {
          donationData = await donationApi.getDonationById(notif.donationId).catch(() => null)
        }
      }

      // Fetch request document if available
      if (notif.requestId) {
        try {
          const reqSnap = await getDoc(doc(firestore, 'requests', notif.requestId))
          if (reqSnap.exists()) {
            requestData = { id: reqSnap.id, ...(reqSnap.data() as any) }
          } else {
            const donReqSnap = await getDoc(doc(firestore, 'donation_requests', notif.requestId))
            if (donReqSnap.exists()) {
              requestData = { id: donReqSnap.id, ...(donReqSnap.data() as any) }
            }
          }
        } catch (_) {}
      }

      const isDonorUser = currentUser?.role === 'DONOR'
      const isRequestAction = notif.type === 'request' || notif.action === 'REQUESTED' || !!notif.requestId

      // If donor clicked a request notification -> Open RequestReviewModal
      if (isDonorUser && isRequestAction) {
        // Construct requestData fallback if not found in db
        if (!requestData && donationData) {
          requestData = {
            id: notif.requestId || `req_${Date.now()}`,
            donationId: donationData.id,
            donorId: donationData.donorId,
            donorName: donationData.donorName,
            recipientId: notif.recipientId,
            recipientName: notif.recipientName || 'Recipient Organization',
            foodTitle: donationData.title,
            requestedServings: donationData.estimatedServings,
            notes: 'Surplus food request',
            status: donationData.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING',
            pickupAddress: donationData.pickupAddress,
            deliveryMethod: donationData.deliveryMethod,
          }
        }

        if (requestData || donationData) {
          setSelectedRequest(requestData)
          setSelectedDonation(donationData)
          return
        }
      }

      // Otherwise -> Open DonationDetailsModal
      if (donationData) {
        setSelectedDonation(donationData)
      }
    } catch (err) {
      console.warn('Error navigating from notification:', err)
    } finally {
      setIsOpening(false)
    }
  }

  const unreadCount = notifs.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Header */}
      <div className="bg-surface border-b border-border px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-bg border border-border flex items-center justify-center hover:bg-border transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-text-primary font-poppins">Live Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-text-secondary">
              {unreadCount} unread update{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold text-primary hover:underline cursor-pointer">
            Mark all read
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-2.5">
        {isOpening && (
          <div className="bg-primary-50 border border-primary-200 text-primary px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Opening donation details...</span>
          </div>
        )}

        {notifs.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center text-text-secondary text-sm">
            No notifications yet. Updates will appear here when food is posted, requested, or delivered!
          </div>
        ) : (
          notifs.map((n) => {
            const style = iconMap[n.type] || iconMap.package
            const Icon = style.icon
            const hasAction = !!n.donationId || !!n.requestId

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                  hasAction ? 'cursor-pointer hover:border-primary-300 hover:shadow-sm' : ''
                } ${n.read ? 'bg-surface border-border' : 'bg-surface border-primary-200 shadow-sm'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                  <Icon className={`w-5 h-5 ${style.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-text-primary leading-snug">{n.title}</p>
                    <span className="text-[10px] font-semibold text-text-secondary flex-shrink-0 mt-0.5">{n.time}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{n.body}</p>
                  {hasAction && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <span>{n.type === 'request' ? 'Review & respond' : 'View food details'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                {!n.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1.5 animate-pulse" />
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Donation Details Modal */}
      {selectedDonation && !selectedRequest && (
        <DonationDetailsModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          userRole={currentUser?.role === 'DONOR' ? 'donor' : 'recipient'}
        />
      )}

      {/* Donor Food Request Review Modal */}
      {selectedRequest && (
        <RequestReviewModal
          request={selectedRequest}
          donation={selectedDonation}
          onClose={() => {
            setSelectedRequest(null)
            setSelectedDonation(null)
          }}
          onStatusChange={(reqId, newStatus) => {
            setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null))
          }}
        />
      )}
    </div>
  )
}

