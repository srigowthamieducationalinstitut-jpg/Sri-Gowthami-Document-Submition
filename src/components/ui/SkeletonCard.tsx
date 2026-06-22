// ============================================
// SkeletonCard — Animated loading placeholder
// ============================================
import { cn } from '@/lib/utils'

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm animate-pulse',
        className
      )}
    >
      {/* Icon + Badge row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-200" />
        <div className="w-16 h-5 rounded-full bg-gray-200" />
      </div>

      {/* Title */}
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />

      {/* Subtitle */}
      <div className="h-3 w-1/2 bg-gray-200 rounded mb-3" />

      {/* Meta row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="flex gap-1">
          <div className="w-7 h-7 rounded-lg bg-gray-200" />
          <div className="w-7 h-7 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  className?: string
}

export function SkeletonGrid({ count = 8, className }: SkeletonGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/** Skeleton row for accordion-style lists (DocumentsPage student rows) */
export function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1">
          <div className="h-4 w-40 bg-gray-200 rounded mb-1.5" />
          <div className="h-3 w-28 bg-gray-200 rounded" />
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="h-8 w-14 bg-gray-200 rounded" />
          <div className="h-8 w-14 bg-gray-200 rounded" />
          <div className="h-8 w-14 bg-gray-200 rounded" />
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

export default SkeletonCard
