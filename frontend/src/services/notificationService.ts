import { firestore } from '../config/firebase'
import { collection, setDoc, doc } from 'firebase/firestore'

export interface AppNotification {
  id: string
  userId?: string
  type: 'delivery' | 'accepted' | 'request' | 'completed' | 'warning' | 'package'
  title: string
  body: string
  time: string
  timestamp: string
  read: boolean
  donationId?: string
}

const LOCAL_NOTIF_KEY = 'foodconnect_notifications'

export function getLocalNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return []
}

export async function sendAppNotification(notifData: {
  type: 'delivery' | 'accepted' | 'request' | 'completed' | 'warning' | 'package'
  title: string
  body: string
  donationId?: string
  userId?: string
}) {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const now = new Date()
  const timeStr = 'Just now'

  const notification: AppNotification = {
    id: notifId,
    type: notifData.type,
    title: notifData.title,
    body: notifData.body,
    time: timeStr,
    timestamp: now.toISOString(),
    read: false,
    donationId: notifData.donationId,
    userId: notifData.userId,
  }

  // 1. Save to LocalStorage
  try {
    const existing = getLocalNotifications()
    const updated = [notification, ...existing]
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(updated))
  } catch (_) {}

  // 2. Save to Cloud Firestore 'notifications' collection
  try {
    const docRef = doc(firestore, 'notifications', notifId)
    await setDoc(docRef, {
      ...notification,
      createdAt: now.toISOString(),
    })
  } catch (err) {
    console.warn('Firestore notification dispatch notice:', err)
  }
}

/**
 * Notify Donor, Recipient, and Volunteer when an action is taken on food
 */
export async function notifyPartiesOnAction(payload: {
  action: 'POSTED' | 'REQUESTED' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED'
  foodTitle: string
  donorName?: string
  recipientName?: string
  volunteerName?: string
  donationId?: string
}) {
  const { action, foodTitle, donorName, recipientName, volunteerName, donationId } = payload

  if (action === 'POSTED') {
    await sendAppNotification({
      type: 'package',
      title: 'New Food Donation Posted 🍲',
      body: `${donorName || 'A donor'} posted "${foodTitle}". Nearby recipients and volunteers have been notified.`,
      donationId,
    })
  } else if (action === 'REQUESTED') {
    await sendAppNotification({
      type: 'request',
      title: 'Food Request Received 📥',
      body: `${recipientName || 'A recipient NGO'} requested "${foodTitle}". Pending volunteer assignment.`,
      donationId,
    })
  } else if (action === 'ACCEPTED') {
    await sendAppNotification({
      type: 'accepted',
      title: 'Delivery Task Claimed 🚴',
      body: `${volunteerName || 'A volunteer'} accepted the delivery task for "${foodTitle}" to ${recipientName || 'recipient'}.`,
      donationId,
    })
  } else if (action === 'PICKED_UP') {
    await sendAppNotification({
      type: 'delivery',
      title: 'Food In Transit 📦',
      body: `${volunteerName || 'Volunteer'} picked up "${foodTitle}" from ${donorName || 'donor'} and is on the way to ${recipientName || 'recipient'}.`,
      donationId,
    })
  } else if (action === 'DELIVERED') {
    await sendAppNotification({
      type: 'completed',
      title: 'Donation Completed 🎉',
      body: `"${foodTitle}" donated by ${donorName || 'donor'} was successfully delivered to ${recipientName || 'recipient'} by ${volunteerName || 'volunteer'}!`,
      donationId,
    })
  }
}
