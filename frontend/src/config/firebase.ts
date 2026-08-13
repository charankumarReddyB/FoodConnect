import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  ConfirmationResult
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: "AIzaSyCBb_mGY5mmFsG2tyzj8ljGueVFu6XcJFY",
  authDomain: "foodconnect-bb349.firebaseapp.com",
  projectId: "foodconnect-bb349",
  storageBucket: "foodconnect-bb349.firebasestorage.app",
  messagingSenderId: "963749903107",
  appId: "1:963749903107:web:31497d8f84adf09cab4736",
  measurementId: "G-GQQLZV19JW"
}

// Initialize Firebase App instance singleton
export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const firebaseAuth = getAuth(firebaseApp)
export const firestore = getFirestore(firebaseApp)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Automatically write/update user document to Cloud Firestore 'users' collection on any login
onAuthStateChanged(firebaseAuth, async (authUser) => {
  if (authUser) {
    try {
      const userRef = doc(firestore, 'users', authUser.uid)
      await setDoc(
        userRef,
        {
          id: authUser.uid,
          uid: authUser.uid,
          fullName: authUser.displayName || authUser.email?.split('@')[0] || 'FoodConnect User',
          email: authUser.email || '',
          phone: authUser.phoneNumber || '',
          photoUrl: authUser.photoURL || '',
          providerId: authUser.providerData[0]?.providerId || 'password',
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
      console.log(`[Firebase Auth] Automatically synced user ${authUser.uid} (${authUser.email}) to Cloud Firestore 'users' collection.`)
    } catch (err) {
      console.warn('[Firebase Auth] Failed to auto-sync user document to Cloud Firestore:', err)
    }
  }
})

// Helper to set up invisible Recaptcha for phone auth
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear()
    } catch (_) {}
  }
  const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('Recaptcha verified')
    },
  })
  ;(window as any).recaptchaVerifier = verifier
  return verifier
}

export {
  signInWithPopup,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult
}
