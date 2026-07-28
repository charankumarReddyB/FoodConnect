import { Users, Package, Truck, ShieldCheck, Bell, TrendingUp, AlertCircle, CheckCircle, ChevronRight, BarChart3 } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

type Screen = string
interface AdminDashboardProps {
  onNavigate: (screen: Screen) => void
}

const donationTrend = [
  { month: 'Jan', donations: 180, meals: 4200 },
  { month: 'Feb', donations: 220, meals: 5100 },
  { month: 'Mar', donations: 195, meals: 4600 },
  { month: 'Apr', donations: 280, meals: 6500 },
  { month: 'May', donations: 340, meals: 7800 },
  { month: 'Jun', donations: 310, meals: 7200 },
  { month: 'Jul', donations: 390, meals: 9100 },
]

const cityData = [
  { city: 'Bangalore', value: 38 },
  { city: 'Chennai', value: 22 },
  { city: 'Mumbai', value: 18 },
  { city: 'Delhi', value: 14 },
  { city: 'Others', value: 8 },
]

const CITY_COLORS = ['#2E7D32', '#4CAF50', '#FF9800', '#1565C0', '#9E9E9E']

const recentActivity = [
  { type: 'new-ngo', msg: 'Bethany Shelter, Kochi verified', time: '5 min ago', icon: CheckCircle, color: 'text-success' },
  { type: 'flag', msg: 'Suspicious activity: User #4821 flagged', time: '18 min ago', icon: AlertCircle, color: 'text-error' },
  { type: 'donation', msg: '42 kg donation posted — Hotel Grand Palace', time: '34 min ago', icon: Package, color: 'text-primary' },
  { type: 'volunteer', msg: 'New volunteer registered: Arun Kumar, Delhi', time: '1h ago', icon: Users, color: 'text-[#6A1B9A]' },
  { type: 'donation', msg: 'Milestone: 50,000 meals delivered', time: '2h ago', icon: TrendingUp, color: 'text-accent' },
]

const pendingVerifications = [
  { name: 'Sunshine Orphanage', city: 'Hyderabad', type: 'NGO', submitted: '2 days ago' },
  { name: 'Ravi Caterers', city: 'Chennai', type: 'Donor', submitted: '3 days ago' },
  { name: 'Green Hearts Trust', city: 'Pune', type: 'NGO', submitted: '5 days ago' },
]

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-bg font-inter">
      {/* Top bar */}
      <div className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-text-secondary">Admin Console</p>
          <h1 className="text-lg font-bold text-text-primary font-poppins">FoodConnect Admin 🛡️</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('notifications')} className="relative w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center">
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
          </button>
          <button onClick={() => onNavigate('profile')} className="w-10 h-10 rounded-full bg-[#B71C1C] text-white font-bold text-sm flex items-center justify-center font-poppins">
            A
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: '8,240', change: '+124 this week', icon: Users, color: 'bg-[#E3F2FD] text-[#1565C0]', trend: '+2.4%' },
            { label: 'Total Donations', value: '12,840', change: '+390 this month', icon: Package, color: 'bg-primary-50 text-primary', trend: '+14%' },
            { label: 'Verified NGOs', value: '284', change: '3 pending review', icon: ShieldCheck, color: 'bg-[#FFEBEE] text-[#B71C1C]', trend: '' },
            { label: 'Active Volunteers', value: '1,642', change: '+68 this month', icon: Truck, color: 'bg-[#F3E5F5] text-[#6A1B9A]', trend: '+5%' },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-5 h-5" />
                </div>
                {s.trend && (
                  <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">{s.trend}</span>
                )}
              </div>
              <p className="text-2xl font-extrabold text-text-primary font-poppins">{s.value}</p>
              <p className="text-xs font-semibold text-text-primary mt-0.5">{s.label}</p>
              <p className="text-xs text-text-secondary">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Donation trend */}
          <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-text-primary font-poppins">Donation Activity</h2>
                <p className="text-xs text-text-secondary mt-0.5">Monthly donations & meals served, 2025</p>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-primary font-medium"><span className="w-3 h-3 rounded-full bg-primary inline-block" />Donations</span>
                <span className="flex items-center gap-1.5 text-accent font-medium"><span className="w-3 h-3 rounded-full bg-accent inline-block" />Meals</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={donationTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12 }}
                  cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="donations" stroke="#2E7D32" strokeWidth={2.5} fill="url(#colorDon)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* City pie */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-base font-bold text-text-primary font-poppins mb-1">By City</h2>
            <p className="text-xs text-text-secondary mb-4">Donation share distribution</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={cityData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {cityData.map((_, i) => (
                    <Cell key={i} fill={CITY_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {cityData.map((c, i) => (
                <div key={c.city} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CITY_COLORS[i] }} />
                    <span className="text-text-secondary">{c.city}</span>
                  </div>
                  <span className="font-semibold text-text-primary">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-text-primary font-poppins">Meals Served per Month</h2>
              <p className="text-xs text-text-secondary mt-0.5">Total beneficiaries reached, 2025</p>
            </div>
            <button className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
              Full Report <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={donationTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12 }} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="meals" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent activity */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-primary font-poppins">Recent Activity</h2>
              <BarChart3 className="w-4 h-4 text-text-secondary" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-bg border border-border flex items-center justify-center flex-shrink-0`}>
                    <a.icon className={`w-4 h-4 ${a.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{a.msg}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending verifications */}
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-primary font-poppins">Pending Verification</h2>
              <span className="text-xs font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                {pendingVerifications.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {pendingVerifications.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-border">
                  <div className="w-9 h-9 rounded-xl bg-[#FFEBEE] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#B71C1C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-secondary">{p.city} · {p.type} · {p.submitted}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-lg hover:bg-success/20">
                      Verify
                    </button>
                    <button className="text-xs font-bold text-error bg-error/10 px-3 py-1.5 rounded-lg hover:bg-error/20">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-[#B71C1C] font-semibold border border-[#FFCDD2] rounded-xl py-2.5 hover:bg-[#FFEBEE]">
              View All Verifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
