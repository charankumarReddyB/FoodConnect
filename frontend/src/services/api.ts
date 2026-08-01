// FoodConnect API Service with Live Spring Boot Backend & JWT Support

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  timestamp?: string
}

export interface PagedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone?: string
  role: 'DONOR' | 'NGO' | 'ORPHANAGE' | 'OLD_AGE_HOME' | 'SHELTER' | 'VOLUNTEER' | 'ADMIN'
  profileImageUrl?: string
  address?: string
  latitude?: number
  longitude?: number
  isActive: boolean
}

export interface JwtAuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  user: UserProfile
}

export interface CheckInRequest {
  userId?: string
  eventId?: string
  location?: string
  notes?: string
}

export interface CheckInResponse {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole?: string
  eventId?: string
  location?: string
  notes?: string
  status: 'CHECKED_IN' | 'CANCELLED'
  checkedInAt: string
}

export interface CheckInStatusResponse {
  checkedIn: boolean
  checkInId?: string
  userId?: string
  userName?: string
  eventId?: string
  location?: string
  status?: 'CHECKED_IN' | 'CANCELLED'
  checkedInAt?: string
  message: string
}

export interface DonationItem {
  id: string
  donorId: string
  donorName: string
  title: string
  description?: string
  foodType: 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN'
  quantityDescription: string
  estimatedServings: number
  preparedTime: string
  expiryTime: string
  pickupAddress: string
  latitude?: number
  longitude?: number
  deliveryMethod: 'SELF_PICKUP' | 'DONOR_DELIVERY' | 'VOLUNTEER_DELIVERY'
  status: 'CREATED' | 'REQUESTED' | 'ACCEPTED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  imageUrls?: string[]
  createdAt?: string
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('foodconnect_token') || ''
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function safeJsonResponse<T>(response: Response, defaultErrorMsg: string): Promise<T> {
  const text = await response.text()
  let json: ApiResponse<T> | null = null

  if (text && text.trim().length > 0) {
    try {
      json = JSON.parse(text)
    } catch (_) {
      // Non-JSON response (HTML, 502/504 gateway timeout or proxy error)
    }
  }

  if (!response.ok) {
    const errorMsg = json?.message || (text && !text.includes('<!DOCTYPE') && !text.includes('<html') ? text : null)
    if (errorMsg) throw new Error(errorMsg)

    if (response.status === 502 || response.status === 504 || response.status === 404 || !text) {
      throw new Error(`Unable to connect to FoodConnect backend server (HTTP ${response.status}). Please ensure the Java Spring Boot backend is running.`)
    }
    throw new Error(`${defaultErrorMsg} (Status ${response.status})`)
  }

  if (!json || json.success === false) {
    throw new Error(json?.message || defaultErrorMsg)
  }

  return json.data as T
}

// Authentication API
export const authApi = {
  async register(data: any): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return safeJsonResponse<UserProfile>(response, 'Registration failed')
  },

  async login(credentials: { email: string; password: string }): Promise<JwtAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const data = await safeJsonResponse<JwtAuthResponse>(response, 'Login failed')
    if (data?.accessToken) {
      localStorage.setItem('foodconnect_token', data.accessToken)
      localStorage.setItem('foodconnect_refresh_token', data.refreshToken)
      if (data.user) {
        localStorage.setItem('foodconnect_user', JSON.stringify(data.user))
      }
    }
    return data
  },

  async googleAuth(data: { googleId: string; email: string; fullName: string; profileImageUrl?: string; role?: string }): Promise<JwtAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await safeJsonResponse<JwtAuthResponse>(response, 'Google authentication failed')
    if (result?.accessToken) {
      localStorage.setItem('foodconnect_token', result.accessToken)
      localStorage.setItem('foodconnect_refresh_token', result.refreshToken)
      if (result.user) {
        localStorage.setItem('foodconnect_user', JSON.stringify(result.user))
      }
    }
    return result
  },

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; message: string; devOtpCode?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    return safeJsonResponse<{ success: boolean; message: string; devOtpCode?: string }>(response, 'Failed to send OTP')
  },

  async verifyPhoneOtp(data: { phone: string; otpCode: string; fullName?: string; email?: string; role?: string }): Promise<JwtAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await safeJsonResponse<JwtAuthResponse>(response, 'OTP verification failed')
    if (result?.accessToken) {
      localStorage.setItem('foodconnect_token', result.accessToken)
      localStorage.setItem('foodconnect_refresh_token', result.refreshToken)
      if (result.user) {
        localStorage.setItem('foodconnect_user', JSON.stringify(result.user))
      }
    }
    return result
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; devResetToken?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    return safeJsonResponse<{ success: boolean; message: string; devResetToken?: string }>(response, 'Failed to process forgot password request')
  },

  async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword }),
    })
    return safeJsonResponse<{ success: boolean; message: string }>(response, 'Failed to reset password')
  },

  async linkAccount(data: { provider: string; googleId?: string; phone?: string; email?: string; password?: string }): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/link-account`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return safeJsonResponse<UserProfile>(response, 'Failed to link account')
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const user = await safeJsonResponse<UserProfile>(response, 'Failed to fetch user profile')
    if (user) {
      localStorage.setItem('foodconnect_user', JSON.stringify(user))
    }
    return user
  },

  async updateProfile(data: { fullName?: string; phone?: string; address?: string; profileImageUrl?: string }): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    const updated = await safeJsonResponse<UserProfile>(response, 'Failed to update profile')
    if (updated) {
      localStorage.setItem('foodconnect_user', JSON.stringify(updated))
    }
    return updated
  },

  logout() {
    localStorage.removeItem('foodconnect_token')
    localStorage.removeItem('foodconnect_refresh_token')
    localStorage.removeItem('foodconnect_user')
  },
}

// Donations API
export const donationsApi = {
  async createDonation(data: any): Promise<DonationItem> {
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return safeJsonResponse<DonationItem>(response, 'Failed to post donation')
  },

  async getNearbyDonations(lat: number, lon: number, radiusKm: number = 10): Promise<DonationItem[]> {
    const response = await fetch(`${API_BASE_URL}/donations/nearby?latitude=${lat}&longitude=${lon}&radiusKm=${radiusKm}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return safeJsonResponse<DonationItem[]>(response, 'Failed to fetch nearby donations')
  },
}

// CheckIn API
export const checkInApi = {
  async checkIn(data?: CheckInRequest): Promise<CheckInResponse> {
    const response = await fetch(`${API_BASE_URL}/checkin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data || {}),
    })
    return safeJsonResponse<CheckInResponse>(response, 'Check-in failed')
  },

  async getStatus(): Promise<CheckInStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/checkin/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return safeJsonResponse<CheckInStatusResponse>(response, 'Failed to retrieve status')
  },

  async getAdminCheckIns(params?: { search?: string; status?: string; page?: number; size?: number }): Promise<PagedResponse<CheckInResponse>> {
    const query = new URLSearchParams()
    if (params?.search) query.append('search', params.search)
    if (params?.status && params.status !== 'ALL') query.append('status', params.status)
    if (params?.page !== undefined) query.append('page', params.page.toString())
    if (params?.size !== undefined) query.append('size', params.size.toString())

    const response = await fetch(`${API_BASE_URL}/admin/checkins?${query.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return safeJsonResponse<PagedResponse<CheckInResponse>>(response, 'Failed to fetch admin check-ins')
  },

  async adminCheckInUser(userId: string, data?: CheckInRequest): Promise<CheckInResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/checkins/user/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data || {}),
    })
    return safeJsonResponse<CheckInResponse>(response, 'Admin check-in failed')
  },

  async adminUndoCheckIn(checkInId: string): Promise<CheckInResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/checkins/${checkInId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    return safeJsonResponse<CheckInResponse>(response, 'Failed to undo check-in')
  },
}
