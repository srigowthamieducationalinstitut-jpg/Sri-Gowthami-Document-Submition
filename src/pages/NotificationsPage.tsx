import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Bell, Check, CheckCheck, Info, CheckCircle2, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useNotificationStore } from '@/store/notificationStore'
import type { NotificationType } from '@/types'

const filterTabs: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Unread', value: 'unread' },
  { label: 'Info', value: 'info' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
]

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('')
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()

  const filtered = useMemo(() => {
    let items = [...notifications]
    if (activeFilter === 'unread') items = items.filter(n => !n.read)
    else if (activeFilter) items = items.filter(n => n.type === activeFilter)
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [activeFilter, notifications])

  const markAllRead = () => markAllAsRead()
  const toggleRead = (id: string) => markAsRead(id)

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return CheckCircle2
      case 'warning': return AlertTriangle
      case 'error': return AlertCircle
      default: return Info
    }
  }
  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-emerald-100 text-emerald-600'
      case 'warning': return 'bg-amber-100 text-amber-600'
      case 'error': return 'bg-rose-100 text-rose-600'
      default: return 'bg-primary-100 text-primary-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-400 mt-0.5">{unreadCount} unread notifications</p>
        </div>
        <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          <CheckCheck className="w-4 h-4" /> Mark all as read
        </button>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
        {filterTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeFilter === tab.value ? 'bg-primary-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {tab.label}
            {tab.value === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-bold">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.map((notif, i) => {
          const isRead = notif.read
          const Icon = getIcon(notif.type)
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => toggleRead(notif.id)}
              className={cn(
                'bg-white rounded-xl border p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-sm',
                isRead ? 'border-slate-200/60' : 'border-primary-200 bg-primary-50/20'
              )}
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', getIconColor(notif.type))}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn('text-sm', isRead ? 'text-slate-600' : 'text-slate-800 font-semibold')}>{notif.title}</h4>
                  {!isRead && <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-xs text-slate-300 mt-2">{formatRelativeTime(notif.createdAt)}</p>
              </div>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-semibold text-slate-600 mb-1">No notifications</h3>
            <p className="text-sm text-slate-400">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}
