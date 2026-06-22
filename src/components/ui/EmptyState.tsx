// ============================================
// EmptyState — Shown when data is empty
// ============================================
import type { LucideIcon } from 'lucide-react'
import { FileX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon = FileX,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        'bg-white rounded-2xl border border-slate-200/60 shadow-sm',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-600 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export default EmptyState
