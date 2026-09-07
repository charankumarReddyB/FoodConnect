import React, { useState, useEffect } from 'react'
import {
  Users,
  Package,
  Truck,
  ShieldCheck,
  Bell,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  BarChart3,
  Search,
  Filter,
  UserCheck,
  RotateCcw,
  Plus,
  X,
  Loader2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  Clock,
  Building,
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {
  checkInApi,
  CheckInResponse,
  adminApi,
  donationApi,
  DonationItem,
  UserProfile,
} from '../services/api'
import { firestore } from '../config/firebase'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import DonationDetailsModal from '../components/DonationDetailsModal'

export type AdminTab = 'analytics' | 'users' | 'donations' | 'checkins'

type Screen = string
interface AdminDashboardProps {
  onNavigate: (screen: Screen) => void
  initialTab?: AdminTab
}

const CITY_COLORS = ['#2E7D32', '#4CAF50', '#FF9800', '#1565C0', '#9E9E9E']

const roleBadgeColors: Record<string, { bg: string; text: string }> = {
  DONOR: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700' },
  RECIPIENT: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700' },
  NGO: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700' },
  ORPHANAGE: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700' },
  OLD_AGE_HOME: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700' },
  SHELTER: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700' },
  VOLUNTEER: { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700' },
  ADMIN: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700' },
}

const donationStatusConfig: Record<string, { label: string; bg: string }> = {
  AVAILABLE: { label: 'Available', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CREATED: { label: 'Available', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REQUESTED: { label: 'Requested', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  ACCEPTED: { label: 'Accepted', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  PICKED_UP: { label: 'Picked Up', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_TRANSIT: { label: 'In Transit', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  DELIVERED: { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50 text-red-700 border-red-200' },
  EXPIRED: { label: 'Expired', bg: 'bg-gray-50 text-gray-700 border-gray-200' },
}

export default function AdminDashboard({ onNavigate, initialTab = 'analytics' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab)

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // ==========================================
  // REAL FIRESTORE USERS STATE
  // ==========================================
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true)
  const [userSearchTerm, setUserSearchTerm] = useState<string>('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL')
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [editingUserRole, setEditingUserRole] = useState<string>('')
  const [isUpdatingUser, setIsUpdatingUser] = useState<boolean>(false)

  // Real-time Firestore users listener
  useEffect(() => {
    let unsubscribe: () => void = () => {}
    setIsLoadingUsers(true)

    try {
      unsubscribe = onSnapshot(
        collection(firestore, 'users'),
        (snapshot) => {
          const list: UserProfile[] = []
          snapshot.forEach((d) => {
            const data = d.data()
            list.push({
              id: d.id,
              fullName: data.fullName || data.name || 'FoodConnect User',
              email: data.email || '',
              phone: data.phone || '',
              role: data.role || 'DONOR',
              profileImageUrl: data.profileImageUrl || data.photoUrl || '',
              address: data.address || '',
              latitude: data.latitude,
              longitude: data.longitude,
              isActive: data.isActive !== false,
              ...(data.createdAt ? { createdAt: data.createdAt } : {}),
            } as any)
          })

          if (list.length > 0) {
            setUsers(list)
            setIsLoadingUsers(false)
          } else {
            // Fallback to Spring Boot admin API if firestore collection is empty
            adminApi
              .getAllUsers('ALL', 0, 100)
              .then((res) => {
                setUsers(res.content || [])
              })
              .catch(() => {})
              .finally(() => setIsLoadingUsers(false))
          }
        },
        (err) => {
          console.warn('Firestore users subscription warning:', err)
          adminApi
            .getAllUsers('ALL', 0, 100)
            .then((res) => {
              setUsers(res.content || [])
            })
            .catch(() => {})
            .finally(() => setIsLoadingUsers(false))
        }
      )
    } catch (e) {
      console.warn('Firestore users query init:', e)
      setIsLoadingUsers(false)
    }

    return () => unsubscribe()
  }, [])

  // ==========================================
  // REAL FIRESTORE DONATIONS STATE
  // ==========================================
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [isLoadingDonations, setIsLoadingDonations] = useState<boolean>(true)
  const [donationSearchTerm, setDonationSearchTerm] = useState<string>('')
  const [donationStatusFilter, setDonationStatusFilter] = useState<string>('ALL')
  const [donationTypeFilter, setDonationTypeFilter] = useState<string>('ALL')
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null)

  // Real-time Firestore donations listener
  useEffect(() => {
    let unsubscribe: () => void = () => {}
    setIsLoadingDonations(true)

    try {
      unsubscribe = onSnapshot(
        collection(firestore, 'donations'),
        (snapshot) => {
          const list: DonationItem[] = []
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) })
          })

          if (list.length > 0) {
            // Sort by createdAt descending
            list.sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
              return timeB - timeA
            })
            setDonations(list)
            setIsLoadingDonations(false)
          } else {
            // Fallback to local storage or API
            const localRaw = localStorage.getItem('foodconnect_local_donations')
            if (localRaw) {
              try {
                setDonations(JSON.parse(localRaw))
              } catch (_) {}
            }
            donationApi
              .getDonations()
              .then((res) => {
                if (res?.content && res.content.length > 0) {
                  setDonations(res.content)
                }
              })
              .catch(() => {})
              .finally(() => setIsLoadingDonations(false))
          }
        },
        (err) => {
          console.warn('Firestore donations query warning:', err)
          setIsLoadingDonations(false)
        }
      )
    } catch (e) {
      console.warn('Firestore donations query init:', e)
      setIsLoadingDonations(false)
    }

    return () => unsubscribe()
  }, [])

  // ==========================================
  // CHECK-IN MANAGEMENT STATE (TASK 3)
  // ==========================================
  const [checkIns, setCheckIns] = useState<CheckInResponse[]>([])
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const [showManualModal, setShowManualModal] = useState(false)
  const [manualUserId, setManualUserId] = useState('')
  const [manualEventId, setManualEventId] = useState('EVT-MANUAL-CHECKIN')
  const [manualLocation, setManualLocation] = useState('Central Food Hub')
  const [manualNotes, setManualNotes] = useState('')
  const [isSubmittingManual, setIsSubmittingManual] = useState(false)

  const loadCheckIns = async () => {
    setIsLoadingCheckIns(true)
    try {
      const res = await checkInApi.getAdminCheckIns({
        search: searchTerm,
        status: statusFilter,
      })
      setCheckIns(res.content || [])
    } catch (err: any) {
      console.error('Error fetching admin check-in records:', err)
    } finally {
      setIsLoadingCheckIns(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'checkins') {
      loadCheckIns()
    }
  }, [activeTab, searchTerm, statusFilter])

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualUserId) return

    setIsSubmittingManual(true)
    try {
      await checkInApi.adminCheckInUser(manualUserId, {
        eventId: manualEventId,
        location: manualLocation,
        notes: manualNotes,
      })
      setActionMessage(`User #${manualUserId} successfully marked as checked in!`)
      setShowManualModal(false)
      setManualUserId('')
      setManualNotes('')
      loadCheckIns()
    } catch (err: any) {
      setActionMessage(`Failed to check in user: ${err.message}`)
    } finally {
      setIsSubmittingManual(false)
      setTimeout(() => setActionMessage(null), 4000)
    }
  }

  const handleUndoCheckIn = async (checkInId: string) => {
    try {
      await checkInApi.adminUndoCheckIn(checkInId)
      setActionMessage(`Check-in record #${checkInId} has been cancelled.`)
      loadCheckIns()
    } catch (err: any) {
      setActionMessage(`Failed to undo check-in: ${err.message}`)
    } finally {
      setTimeout(() => setActionMessage(null), 4000)
    }
  }

  // ==========================================
  // USER ACTIONS: CHANGE ROLE & TOGGLE ACTIVE
  // ==========================================
  const handleOpenUserModal = (u: UserProfile) => {
    setSelectedUser(u)
    setEditingUserRole(u.role)
  }

  const handleUpdateUserRole = async () => {
    if (!selectedUser || !editingUserRole) return
    setIsUpdatingUser(true)

    try {
      // Update in Firestore
      const userRef = doc(firestore, 'users', selectedUser.id)
      await updateDoc(userRef, {
        role: editingUserRole,
        updatedAt: new Date().toISOString(),
      })

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: editingUserRole as any } : u))
      )
      setSelectedUser((prev) => (prev ? { ...prev, role: editingUserRole as any } : null))
      setActionMessage(`Updated role for ${selectedUser.fullName} to ${editingUserRole}`)
    } catch (err: any) {
      console.error('Error updating user role:', err)
      setActionMessage(`Failed to update role: ${err.message}`)
    } finally {
      setIsUpdatingUser(false)
      setTimeout(() => setActionMessage(null), 4000)
    }
  }

  const handleToggleUserActive = async () => {
    if (!selectedUser) return
    setIsUpdatingUser(true)
    const newActiveState = !selectedUser.isActive

    try {
      // 1. Update Firestore
      const userRef = doc(firestore, 'users', selectedUser.id)
      await updateDoc(userRef, {
        isActive: newActiveState,
        updatedAt: new Date().toISOString(),
      })

      // 2. Update Spring Boot backend
      adminApi.toggleUserStatus(selectedUser.id, newActiveState).catch(() => null)

      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, isActive: newActiveState } : u))
      )
      setSelectedUser((prev) => (prev ? { ...prev, isActive: newActiveState } : null))
      setActionMessage(`Account for ${selectedUser.fullName} set to ${newActiveState ? 'Active' : 'Inactive'}`)
    } catch (err: any) {
      console.error('Error toggling user active status:', err)
      setActionMessage(`Failed to update status: ${err.message}`)
    } finally {
      setIsUpdatingUser(false)
      setTimeout(() => setActionMessage(null), 4000)
    }
  }

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearchTerm)) ||
      (u.address && u.address.toLowerCase().includes(userSearchTerm.toLowerCase()))

    let matchesRole = true
    if (userRoleFilter !== 'ALL') {
      if (userRoleFilter === 'RECIPIENT') {
        matchesRole = ['NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'SHELTER', 'RECIPIENT'].includes(u.role)
      } else {
        matchesRole = u.role === userRoleFilter
      }
    }

    let matchesStatus = true
    if (userStatusFilter === 'ACTIVE') matchesStatus = u.isActive !== false
    if (userStatusFilter === 'INACTIVE') matchesStatus = u.isActive === false

    return matchesSearch && matchesRole && matchesStatus
  })

  // Filtered Donations
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(donationSearchTerm.toLowerCase()) ||
      (d.donorName && d.donorName.toLowerCase().includes(donationSearchTerm.toLowerCase())) ||
      (d.pickupAddress && d.pickupAddress.toLowerCase().includes(donationSearchTerm.toLowerCase()))

    let matchesStatus = true
    if (donationStatusFilter !== 'ALL') {
      matchesStatus = d.status === donationStatusFilter
    }

    let matchesType = true
    if (donationTypeFilter !== 'ALL') {
      matchesType = d.foodType === donationTypeFilter
    }

    return matchesSearch && matchesStatus && matchesType
  })

  // Dynamic Live Counts from Real Data
  const totalUsersCount = users.length
  const totalDonationsCount = donations.length
  const totalNgosCount = users.filter((u) =>
    ['NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'SHELTER', 'RECIPIENT'].includes(u.role)
  ).length
  const totalVolunteersCount = users.filter((u) => u.role === 'VOLUNTEER').length
  const totalMealsEstimate = donations.reduce((acc, d) => acc + (d.estimatedServings || 0), 0)

  // Dynamic Chart Data based on actual donations
  const vegCount = donations.filter((d) => d.foodType === 'VEG').length
  const nonVegCount = donations.filter((d) => d.foodType === 'NON_VEG' || d.foodType === 'EGG').length
  const pieDistribution = [
    { name: 'Veg Dishes', value: vegCount || 1 },
    { name: 'Non-Veg Dishes', value: nonVegCount || 1 },
  ]

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent'
    try {
      return new Date(isoString).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Top Bar */}
      <div className="bg-surface border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sticky top-0 z-10">
        <div>
          <p className="text-xs text-text-secondary">Platform Administration</p>
          <h1 className="text-lg font-bold text-text-primary font-poppins flex items-center gap-1.5">
            FoodConnect Admin <ShieldCheck className="w-5 h-5 text-rose-600 inline" />
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Navigation Tab Switcher */}
          <div className="flex bg-bg p-1 rounded-xl border border-border overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-surface shadow-sm text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-surface shadow-sm text-[#1565C0]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users ({totalUsersCount})
            </button>

            <button
              onClick={() => setActiveTab('donations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'donations'
                  ? 'bg-surface shadow-sm text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Donations ({totalDonationsCount})
            </button>

            <button
              onClick={() => setActiveTab('checkins')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'checkins'
                  ? 'bg-surface shadow-sm text-[#B71C1C]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Check-ins
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('notifications')}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-bg border border-border flex items-center justify-center cursor-pointer hover:bg-border transition-colors"
            >
              <Bell className="w-5 h-5 text-text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#B71C1C] text-white font-bold text-sm flex items-center justify-center font-poppins cursor-pointer"
            >
              A
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* Action toast message */}
        {actionMessage && (
          <div className="bg-[#B71C1C] text-white text-sm px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: USERS MANAGEMENT (SECTIONS 8, 9, 11) */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-6 rounded-3xl border border-border shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-text-primary font-poppins flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#1565C0]" />
                  User Directory & Management
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Live user directory synced with Cloud Firestore. Manage roles, view profiles, and update status.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-text-primary bg-bg border border-border px-3 py-1.5 rounded-xl">
                  Total Users: {users.length}
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center gap-3 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by user name, email, phone, or location..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:border-[#1565C0]"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  <Filter className="w-4 h-4" />
                  <span>Role:</span>
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-[#1565C0] cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="DONOR">Donors</option>
                  <option value="RECIPIENT">Recipients / NGOs</option>
                  <option value="VOLUNTEER">Volunteers</option>
                  <option value="ADMIN">Administrators</option>
                </select>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary ml-2">
                  <span>Status:</span>
                </div>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-[#1565C0] cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
              {isLoadingUsers ? (
                <div className="p-12 text-center text-text-secondary text-sm flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1565C0]" />
                  <span>Retrieving registered users from Firestore...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-text-secondary text-sm">
                  <Users className="w-10 h-10 mx-auto text-text-secondary opacity-40 mb-3" />
                  <p className="font-semibold text-text-primary">No users match your criteria</p>
                  <p className="text-xs text-text-secondary mt-1">Try adjusting your role or search filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-bg border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                        <th className="py-3.5 px-5">User Profile</th>
                        <th className="py-3.5 px-5">Contact</th>
                        <th className="py-3.5 px-5">Role</th>
                        <th className="py-3.5 px-5">Account Status</th>
                        <th className="py-3.5 px-5">Location</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {filteredUsers.map((u) => {
                        const rb = roleBadgeColors[u.role] || roleBadgeColors.DONOR
                        return (
                          <tr key={u.id} className="hover:bg-bg/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#E3F2FD] text-[#1565C0] font-bold text-sm flex items-center justify-center flex-shrink-0 font-poppins">
                                  {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-text-primary">{u.fullName}</p>
                                  <p className="text-[11px] text-text-secondary font-mono">ID: {u.id.substring(0, 10)}...</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <p className="font-medium text-text-primary flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-text-secondary" />
                                {u.email}
                              </p>
                              {u.phone && (
                                <p className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-text-secondary" />
                                  {u.phone}
                                </p>
                              )}
                            </td>

                            <td className="py-4 px-5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${rb.bg}`}>
                                {u.role}
                              </span>
                            </td>

                            <td className="py-4 px-5">
                              {u.isActive !== false ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  <X className="w-3 h-3" />
                                  Inactive
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-5">
                              <p className="text-text-primary font-medium flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                                <span className="truncate max-w-[150px]">{u.address || 'Location registered'}</span>
                              </p>
                            </td>

                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={() => handleOpenUserModal(u)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-200 transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Manage
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DONATIONS MANAGEMENT (SECTIONS 10, 11) */}
        {/* ========================================================================= */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-6 rounded-3xl border border-border shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-text-primary font-poppins flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  Food Donations Registry
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  All food donations retrieved from Cloud Firestore. Inspect portions, donor details, and current status.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-text-primary bg-bg border border-border px-3 py-1.5 rounded-xl">
                  Total Posts: {donations.length}
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center gap-3 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by food title, donor name, or pickup location..."
                  value={donationSearchTerm}
                  onChange={(e) => setDonationSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  <Filter className="w-4 h-4" />
                  <span>Status:</span>
                </div>
                <select
                  value={donationStatusFilter}
                  onChange={(e) => setDonationStatusFilter(e.target.value)}
                  className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="REQUESTED">Requested</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="PICKED_UP">Picked Up</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary ml-2">
                  <span>Type:</span>
                </div>
                <select
                  value={donationTypeFilter}
                  onChange={(e) => setDonationTypeFilter(e.target.value)}
                  className="bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Veg</option>
                </select>
              </div>
            </div>

            {/* Donations Table */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
              {isLoadingDonations ? (
                <div className="p-12 text-center text-text-secondary text-sm flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span>Retrieving live donations from Firestore...</span>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="p-12 text-center text-text-secondary text-sm">
                  <Package className="w-10 h-10 mx-auto text-text-secondary opacity-40 mb-3" />
                  <p className="font-semibold text-text-primary">No donations found</p>
                  <p className="text-xs text-text-secondary mt-1">Try resetting your status or search filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-bg border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                        <th className="py-3.5 px-5">Food Donation</th>
                        <th className="py-3.5 px-5">Quantity / Servings</th>
                        <th className="py-3.5 px-5">Donor</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5">Delivery Method</th>
                        <th className="py-3.5 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {filteredDonations.map((d) => {
                        const sc = donationStatusConfig[d.status] || donationStatusConfig.AVAILABLE
                        return (
                          <tr key={d.id} className="hover:bg-bg/50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {d.imageUrls && d.imageUrls.length > 0 ? (
                                    <img src={d.imageUrls[0]} alt={d.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-5 h-5 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-text-primary">{d.title}</p>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                        d.foodType === 'VEG'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-red-50 text-red-700'
                                      }`}
                                    >
                                      {d.foodType}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-text-secondary truncate max-w-[200px]">
                                    {d.pickupAddress}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <p className="font-bold text-text-primary">{d.quantityDescription}</p>
                              <p className="text-[11px] text-text-secondary">{d.estimatedServings} est. servings</p>
                            </td>

                            <td className="py-4 px-5">
                              <p className="font-semibold text-text-primary">{d.donorName || 'Donor'}</p>
                              <p className="text-[11px] text-text-secondary">
                                {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Active'}
                              </p>
                            </td>

                            <td className="py-4 px-5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${sc.bg}`}>
                                {sc.label}
                              </span>
                            </td>

                            <td className="py-4 px-5">
                              <span className="text-[11px] text-text-secondary flex items-center gap-1">
                                {d.deliveryMethod === 'VOLUNTEER_DELIVERY' ? (
                                  <>
                                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Volunteer Delivery</span>
                                  </>
                                ) : (
                                  <>
                                    <Building className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Self-Pickup</span>
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={() => setSelectedDonation(d)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-200 transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CHECK-INS VERIFICATION (TASK 3) */}
        {/* ========================================================================= */}
        {activeTab === 'checkins' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-6 rounded-3xl border border-border shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-text-primary font-poppins flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-[#B71C1C]" />
                  Check-in Verification & Audit
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Manage active member check-ins, view timestamp logs, search records, or perform manual admin check-ins.
                </p>
              </div>

              <button
                onClick={() => setShowManualModal(true)}
                className="bg-[#B71C1C] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow hover:bg-[#880E4F] flex items-center gap-2 transition-all cursor-pointer w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Mark User Checked-in</span>
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center gap-4 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by user name, email, or event ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-xl text-xs font-medium text-text-primary focus:outline-none focus:border-[#B71C1C]"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                  <Filter className="w-4 h-4 text-text-secondary" />
                  <span>Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-bg border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-text-primary focus:outline-none focus:border-[#B71C1C] cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Checked-In Users Table */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
              {isLoadingCheckIns ? (
                <div className="p-12 text-center text-text-secondary text-sm flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-[#B71C1C]" />
                  <span>Loading check-in records...</span>
                </div>
              ) : checkIns.length === 0 ? (
                <div className="p-12 text-center text-text-secondary text-sm">
                  <UserCheck className="w-10 h-10 mx-auto text-text-secondary opacity-40 mb-3" />
                  <p className="font-semibold text-text-primary">No check-in records found</p>
                  <p className="text-xs text-text-secondary mt-1">Try clearing your search query or status filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-bg border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                        <th className="py-3.5 px-5">User</th>
                        <th className="py-3.5 px-5">Role</th>
                        <th className="py-3.5 px-5">Event & Location</th>
                        <th className="py-3.5 px-5">Checked In At</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {checkIns.map((record) => (
                        <tr key={record.id} className="hover:bg-bg/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#FFEBEE] text-[#B71C1C] font-bold text-sm flex items-center justify-center flex-shrink-0 font-poppins">
                                {record.userName ? record.userName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-text-primary">{record.userName}</p>
                                <p className="text-[11px] text-text-secondary">{record.userEmail}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-50 text-primary">
                              {record.userRole || 'MEMBER'}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            <p className="font-semibold text-text-primary flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                              {record.eventId || 'General Drive'}
                            </p>
                            <p className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-text-secondary" />
                              {record.location || 'Central Location'}
                            </p>
                          </td>

                          <td className="py-4 px-5 font-medium text-text-primary">
                            {formatDate(record.checkedInAt)}
                          </td>

                          <td className="py-4 px-5">
                            {record.status === 'CHECKED_IN' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/15 text-success border border-success/30">
                                <CheckCircle className="w-3 h-3" />
                                Checked In
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-error/15 text-error border border-error/30">
                                <X className="w-3 h-3" />
                                Cancelled
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            {record.status === 'CHECKED_IN' && (
                              <button
                                onClick={() => handleUndoCheckIn(record.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-error bg-error/10 hover:bg-error/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                                title="Undo / Cancel Check-in"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Undo Check-in
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ANALYTICS DASHBOARD (REAL DYNAMIC DATA) */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* KPI Cards calculated from real Firestore data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E3F2FD] text-[#1565C0] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-full">Live</span>
                </div>
                <p className="text-2xl font-extrabold text-text-primary font-poppins">{totalUsersCount}</p>
                <p className="text-xs font-semibold text-text-primary mt-0.5">Total Registered Users</p>
                <p className="text-xs text-text-secondary">Synced with Firestore</p>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <p className="text-2xl font-extrabold text-text-primary font-poppins">{totalDonationsCount}</p>
                <p className="text-xs font-semibold text-text-primary mt-0.5">Total Food Donations</p>
                <p className="text-xs text-text-secondary">~{totalMealsEstimate} total meals</p>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFEBEE] text-[#B71C1C] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-text-primary font-poppins">{totalNgosCount}</p>
                <p className="text-xs font-semibold text-text-primary mt-0.5">Verified Recipient NGOs</p>
                <p className="text-xs text-text-secondary">Shelters & Orphanages</p>
              </div>

              <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F3E5F5] text-[#6A1B9A] flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-text-primary font-poppins">{totalVolunteersCount}</p>
                <p className="text-xs font-semibold text-text-primary mt-0.5">Active Volunteers</p>
                <p className="text-xs text-text-secondary">Available for delivery</p>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Category distribution */}
              <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-text-primary font-poppins">Food Type Distribution</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Live dish categories from posted donations</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Vegetarian', count: vegCount },
                    { name: 'Non-Veg / Egg', count: nonVegCount },
                    { name: 'Active Users', count: users.filter(u => u.isActive !== false).length },
                    { name: 'Live Posts', count: donations.filter(d => d.status === 'AVAILABLE').length },
                  ]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#2E7D32" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie breakdown */}
              <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
                <h2 className="text-base font-bold text-text-primary font-poppins mb-1">Donation Split</h2>
                <p className="text-xs text-text-secondary mb-4">Veg vs Non-Veg share</p>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {pieDistribution.map((_, i) => (
                        <Cell key={i} fill={CITY_COLORS[i % CITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]" />
                      <span className="text-text-secondary">Veg Dishes</span>
                    </div>
                    <span className="font-semibold text-text-primary">{vegCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
                      <span className="text-text-secondary">Non-Veg Dishes</span>
                    </div>
                    <span className="font-semibold text-text-primary">{nonVegCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* USER MANAGEMENT & DETAILS MODAL (SECTIONS 8, 9) */}
      {/* ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative animate-scale-in">
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary font-poppins">User Management</h3>
                <p className="text-xs text-text-secondary">View user details and update account permissions.</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-bg border border-border hover:bg-border text-text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Profile Card */}
              <div className="bg-bg p-4 rounded-2xl border border-border flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E3F2FD] text-[#1565C0] font-bold text-lg flex items-center justify-center font-poppins flex-shrink-0">
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="text-base font-bold text-text-primary font-poppins">{selectedUser.fullName}</h4>
                  <p className="text-xs text-text-secondary font-mono">ID: {selectedUser.id}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-bg p-3.5 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-text-secondary font-semibold">Email:</span>
                  <span className="font-bold text-text-primary">{selectedUser.email}</span>
                </div>

                <div className="bg-bg p-3.5 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-text-secondary font-semibold">Phone:</span>
                  <span className="font-bold text-text-primary">{selectedUser.phone || 'Not provided'}</span>
                </div>

                <div className="bg-bg p-3.5 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-text-secondary font-semibold">Current Role:</span>
                  <span className="font-bold text-text-primary">{selectedUser.role}</span>
                </div>

                <div className="bg-bg p-3.5 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-text-secondary font-semibold">Account Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md ${
                      selectedUser.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedUser.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {selectedUser.address && (
                  <div className="bg-bg p-3.5 rounded-xl border border-border">
                    <span className="text-text-secondary font-semibold block mb-0.5">Address:</span>
                    <span className="font-medium text-text-primary">{selectedUser.address}</span>
                  </div>
                )}
              </div>

              {/* Role Update Section */}
              <div className="bg-surface p-4 rounded-2xl border border-border space-y-2.5">
                <label className="text-xs font-bold text-text-primary block">Change Role</label>
                <div className="flex items-center gap-2">
                  <select
                    value={editingUserRole}
                    onChange={(e) => setEditingUserRole(e.target.value)}
                    className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="DONOR">DONOR</option>
                    <option value="RECIPIENT">RECIPIENT</option>
                    <option value="NGO">NGO</option>
                    <option value="ORPHANAGE">ORPHANAGE</option>
                    <option value="OLD_AGE_HOME">OLD_AGE_HOME</option>
                    <option value="SHELTER">SHELTER</option>
                    <option value="VOLUNTEER">VOLUNTEER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>

                  <button
                    onClick={handleUpdateUserRole}
                    disabled={isUpdatingUser || editingUserRole === selectedUser.role}
                    className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-40 cursor-pointer"
                  >
                    Save Role
                  </button>
                </div>
              </div>

              {/* Toggle Account Status */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={handleToggleUserActive}
                  disabled={isUpdatingUser}
                  className={`w-full sm:flex-1 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedUser.isActive !== false
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {selectedUser.isActive !== false ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-red-600" />
                      <span>Deactivate User Account</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-emerald-600" />
                      <span>Activate User Account</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full sm:flex-1 bg-bg border border-border text-text-primary font-bold py-3 rounded-xl text-xs hover:bg-border transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Details Modal */}
      {selectedDonation && (
        <DonationDetailsModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          userRole="admin"
        />
      )}

      {/* Manual Check-in Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text-primary font-poppins flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#B71C1C]" />
                Manual Check-in
              </h3>
              <button onClick={() => setShowManualModal(false)} className="p-1 hover:bg-bg rounded-lg cursor-pointer">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">User ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter User ID"
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-[#B71C1C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Event ID</label>
                <input
                  type="text"
                  placeholder="EVT-COMMUNITY-DRIVE"
                  value={manualEventId}
                  onChange={(e) => setManualEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-[#B71C1C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Central Hub"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-[#B71C1C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Admin manual check-in verification note"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-[#B71C1C]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-bg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="flex-1 py-2.5 rounded-xl bg-[#B71C1C] text-white text-xs font-bold shadow hover:bg-[#880E4F] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingManual ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking In...</span>
                    </>
                  ) : (
                    <span>Confirm Check-in</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
