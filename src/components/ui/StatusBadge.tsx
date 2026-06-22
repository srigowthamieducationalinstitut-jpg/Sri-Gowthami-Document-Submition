// ============================================
// StatusBadge — Reusable color-coded status pill
// ============================================
import { cn } from '@/lib/utils'
import type { DocumentStatus, ApplicationStatus } from '@/types'

type StatusType = DocumentStatus | ApplicationStatus

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  // Document statuses
  verified:             { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Verified' },
  pending:              { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pending' },
  rejected:             { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Rejected' },
  under_review:         { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Under Review' },
  uploaded:             { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Uploaded' },
  // Application statuses
  draft:                { bg: 'bg-slate-100',  text: 'text-slate-600',  label: 'Draft' },
  submitted:            { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Submitted' },
  approved:             { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Approved' },
  admission_completed:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Admission Completed' },
}

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    label: status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold leading-tight',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export default StatusBadge
