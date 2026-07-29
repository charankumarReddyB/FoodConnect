// FoodConnect API Service with Live Spring Boot Backend & JWT Support

const API_BASE_URL = '/api/v1'

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

// Authentication API
export const authApi = {
  async register(data: any): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json: ApiResponse<UserProfile> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Registration failed')
    return json.data!
  },

  async login(credentials: { email: string; password: string }): Promise<JwtAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const json: ApiResponse<JwtAuthResponse> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Login failed')
    if (json.data?.accessToken) {
      localStorage.setItem('foodconnect_token', json.data.accessToken)
      localStorage.setItem('foodconnect_refresh_token', json.data.refreshToken)
    }
    return json.data!
  },

  async getCurrentUser(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const json: ApiResponse<UserProfile> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Failed to fetch user profile')
    return json.data!
  },

  logout() {
    localStorage.removeItem('foodconnect_token')
    localStorage.removeItem('foodconnect_refresh_token')
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
    const json: ApiResponse<DonationItem> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Failed to post donation')
    return json.data!
  },

  async getNearbyDonations(lat: number, lon: number, radiusKm: number = 10): Promise<DonationItem[]> {
    const response = await fetch(`${API_BASE_URL}/donations/nearby?latitude=${lat}&longitude=${lon}&radiusKm=${radiusKm}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const json: ApiResponse<DonationItem[]> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Failed to fetch nearby donations')
    return json.data || []
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
    const json: ApiResponse<CheckInResponse> = await response.json()
    if (!response.ok) {
      const err: any = new Error(json.message || 'Check-in failed')
      err.status = response.status
      throw err
    }
    return json.data!
  },

  async getStatus(): Promise<CheckInStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/checkin/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const json: ApiResponse<CheckInStatusResponse> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Failed to retrieve status')
    return json.data!
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
    const json: ApiResponse<PagedResponse<CheckInResponse>> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Failed to fetch admin check-ins')
    return json.data!
  },

  async adminCheckInUser(userId: string, data?: CheckInRequest): Promise<CheckInResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/checkins/user/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data || {}),
    })
    const json: ApiResponse<CheckInResponse> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Admin check-in failed')
    return json.data!
  },

  async adminUndoCheckIn(checkInId: string): Promise<CheckInResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/checkins/${checkInId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    const json: ApiResponse<CheckInResponse> = await response.json()
    if (!response.ok) throw new Error(json.message || 'Failed to undo check-in')
    return json.data!
  },
}
