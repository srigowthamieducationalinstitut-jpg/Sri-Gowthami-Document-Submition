import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    submitted: 'bg-primary-50 text-primary-600',
    under_review: 'bg-amber-50 text-amber-600',
    approved: 'bg-emerald-50 text-emerald-600',
    rejected: 'bg-rose-50 text-rose-600',
    admission_completed: 'bg-emerald-50 text-emerald-700',
    uploaded: 'bg-primary-50 text-primary-600',
    pending: 'bg-amber-50 text-amber-600',
    verified: 'bg-emerald-50 text-emerald-600',
  }
  return colors[status] || 'bg-slate-100 text-slate-600'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    admission_completed: 'Admission Completed',
    uploaded: 'Uploaded',
    pending: 'Pending',
    verified: 'Verified',
    pending_resubmission: 'Resubmission Required',
  }
  return labels[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    aadhaar: 'Aadhaar Card',
    marks_memo_10: '10th Marks Memo',
    marks_memo_12: '12th Marks Memo',
    tc_10: '10th TC',
    tc_12: '12th TC',
    passport_photo: 'Passport-size Photo',
    bonafide_10: '10th Bonafide Certificate',
    bonafide_12: '12th Bonafide Certificate',
    migration_certificate: 'Migration Certificate',
    rank_card: 'Entrance Exam Rank Card',
    caste_certificate: 'Caste Certificate',
    income_certificate: 'Income Certificate',
    medical_certificate: 'Medical Certificate',
    other: 'Other Document',
  }
  return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function generateApplicationNumber(): string {
  const year = new Date().getFullYear()
  const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `SGI-${year}-${num}`
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}
