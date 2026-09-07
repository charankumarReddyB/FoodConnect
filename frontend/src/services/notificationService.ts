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
  requestId?: string
  recipientId?: string
  recipientName?: string
  donorId?: string
  donorName?: string
  foodTitle?: string
  action?: 'POSTED' | 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'PICKED_UP' | 'DELIVERED' | string
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
  requestId?: string
  recipientId?: string
  recipientName?: string
  donorId?: string
  donorName?: string
  foodTitle?: string
  action?: string
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
    requestId: notifData.requestId,
    recipientId: notifData.recipientId,
    recipientName: notifData.recipientName,
    donorId: notifData.donorId,
    donorName: notifData.donorName,
    foodTitle: notifData.foodTitle,
    action: notifData.action,
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
  action: 'POSTED' | 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'PICKED_UP' | 'DELIVERED'
  foodTitle: string
  donorName?: string
  donorId?: string
  recipientName?: string
  recipientId?: string
  volunteerName?: string
  volunteerId?: string
  donationId?: string
  requestId?: string
  volunteerDeliveryRequired?: boolean
}) {
  const {
    action,
    foodTitle,
    donorName,
    donorId,
    recipientName,
    recipientId,
    volunteerName,
    donationId,
    requestId,
    volunteerDeliveryRequired,
  } = payload

  if (action === 'POSTED') {
    await sendAppNotification({
      type: 'package',
      title: 'New Food Donation Posted 🍲',
      body: `${donorName || 'A donor'} posted "${foodTitle}". Nearby recipients and volunteers have been notified.`,
      donationId,
      donorId,
      donorName,
      foodTitle,
      action: 'POSTED',
    })
  } else if (action === 'REQUESTED') {
    // Notify the donor that a recipient has requested this food
    await sendAppNotification({
      type: 'request',
      title: 'Food Request Received 📥',
      body: `${recipientName || 'A recipient'} requested your "${foodTitle}". Tap to review and respond.`,
      donationId,
      requestId,
      recipientId,
      recipientName,
      donorId,
      donorName,
      foodTitle,
      action: 'REQUESTED',
      userId: donorId,
    })
  } else if (action === 'ACCEPTED') {
    // 1. Notify the recipient that donor accepted the request
    await sendAppNotification({
      type: 'accepted',
      title: 'Food Request Accepted ✅',
      body: `Your request for "${foodTitle}" has been accepted by ${donorName || 'the donor'}.`,
      donationId,
      requestId,
      recipientId,
      recipientName,
      donorId,
      donorName,
      foodTitle,
      action: 'ACCEPTED',
      userId: recipientId,
    })

    // 2. VOLUNTEER NOTIFICATION LOGIC:
    // Only notify volunteers if volunteer delivery is actually required
    if (volunteerDeliveryRequired) {
      await sendAppNotification({
        type: 'delivery',
        title: 'Delivery Request Available 🚴',
        body: `A food delivery request for "${foodTitle}" requires volunteer assistance.`,
        donationId,
        requestId,
        donorId,
        donorName,
        recipientId,
        recipientName,
        foodTitle,
        action: 'ACCEPTED',
      })
    }
  } else if (action === 'REJECTED') {
    // Notify the recipient that the request was rejected
    await sendAppNotification({
      type: 'warning',
      title: 'Food Request Rejected ❌',
      body: `Your request for "${foodTitle}" was not accepted.`,
      donationId,
      requestId,
      recipientId,
      recipientName,
      donorId,
      donorName,
      foodTitle,
      action: 'REJECTED',
      userId: recipientId,
    })
    // Volunteers are NOT notified on rejection
  } else if (action === 'PICKED_UP') {
    await sendAppNotification({
      type: 'delivery',
      title: 'Food In Transit 📦',
      body: `${volunteerName || 'Volunteer'} picked up "${foodTitle}" from ${donorName || 'donor'} and is on the way to ${recipientName || 'recipient'}.`,
      donationId,
      requestId,
      foodTitle,
      action: 'PICKED_UP',
    })
  } else if (action === 'DELIVERED') {
    await sendAppNotification({
      type: 'completed',
      title: 'Donation Completed 🎉',
      body: `"${foodTitle}" donated by ${donorName || 'donor'} was successfully delivered to ${recipientName || 'recipient'} by ${volunteerName || 'volunteer'}!`,
      donationId,
      requestId,
      foodTitle,
      action: 'DELIVERED',
    })
  }
}
