import { LucideIcon, PackageOpen, AlertTriangle, WifiOff, ShieldAlert, Search } from 'lucide-react'

interface EmptyStateProps {
  type?: 'empty' | 'search' | 'error' | 'offline' | 'permission'
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  type = 'empty',
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const iconMap: Record<string, LucideIcon> = {
    empty: PackageOpen,
    search: Search,
    error: AlertTriangle,
    offline: WifiOff,
    permission: ShieldAlert,
  }

  const IconComponent = icon || iconMap[type] || PackageOpen

  return (
    <div className="bg-surface rounded-3xl border border-border p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 shadow-sm animate-scale-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 shadow-inner">
        <IconComponent className="w-8 h-8 animate-float" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 font-poppins mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 btn-press cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
