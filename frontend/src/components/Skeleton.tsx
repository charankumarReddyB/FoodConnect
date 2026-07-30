export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl skeleton-loader" />
        <div className="w-16 h-6 rounded-full skeleton-loader" />
      </div>
      <div className="h-5 w-3/4 rounded skeleton-loader mb-2" />
      <div className="h-4 w-1/2 rounded skeleton-loader mb-4" />
      <div className="h-10 w-full rounded-xl skeleton-loader" />
    </div>
  )
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl skeleton-loader flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded skeleton-loader" />
            <div className="h-3 w-1/3 rounded skeleton-loader" />
          </div>
          <div className="w-20 h-8 rounded-lg skeleton-loader flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface rounded-2xl border border-border p-5">
          <div className="w-10 h-10 rounded-xl skeleton-loader mb-3" />
          <div className="h-7 w-1/2 rounded skeleton-loader mb-1" />
          <div className="h-3 w-3/4 rounded skeleton-loader" />
        </div>
      ))}
    </div>
  )
}
