import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Plus, LayoutGrid, List, Eye, Edit, Trash2, Check, X, Bell, ChevronLeft, ChevronRight, ArrowUpDown, Download, MoreHorizontal, Filter } from 'lucide-react'
import { cn, getStatusColor, getStatusLabel, formatDate, getInitials } from '@/lib/utils'
import { useApplicationStore } from '@/store/applicationStore'
import type { Application, ApplicationStatus } from '@/types'

const statusOptions: { label: string; value: string }[] = [
  { label: 'All Status', value: '' },
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'admission_completed' },
]

export default function ApplicationsPage() {
  const navigate = useNavigate()
  const { applications, fetchApplications } = useApplicationStore()
  
  useEffect(() => {
    fetchApplications()
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<'createdAt' | 'studentName'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const pageSize = 10

  const filtered = useMemo(() => {
    let items = [...applications]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter(a =>
        a.studentName.toLowerCase().includes(q) ||
        a.applicationNumber.toLowerCase().includes(q) ||
        a.studentPhone.includes(q) ||
        a.studentEmail.toLowerCase().includes(q) ||
        a.courseName.toLowerCase().includes(q)
      )
    }
    if (statusFilter) {
      items = items.filter(a => a.status === statusFilter)
    }
    items.sort((a, b) => {
      const valA = sortField === 'createdAt' ? new Date(a.createdAt).getTime() : a.studentName
      const valB = sortField === 'createdAt' ? new Date(b.createdAt).getTime() : b.studentName
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return items
  }, [searchQuery, statusFilter, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const toggleAll = () => {
    setSelectedIds(prev => prev.length === paginated.length ? [] : paginated.map(a => a.id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Application Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">{filtered.length} applications found</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all shrink-0">
          <Plus className="w-4 h-4" /> New Application
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              placeholder="Search by name, ID, phone, email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none min-w-[150px]"
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setViewMode('table')} className={cn('p-2 rounded-lg transition-all', viewMode === 'table' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600')}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-center gap-3"
          >
            <span className="text-sm font-medium text-primary-700">{selectedIds.length} selected</span>
            <div className="flex items-center gap-2 ml-auto">
              <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Approve
              </button>
              <button className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-medium hover:bg-rose-600 flex items-center gap-1">
                <X className="w-3 h-3" /> Reject
              </button>
              <button className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 flex items-center gap-1">
                <Bell className="w-3 h-3" /> Notify
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {viewMode === 'table' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedIds.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-primary-500" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Application #</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider cursor-pointer hover:text-slate-700" onClick={() => { setSortField('studentName'); setSortDir(d => d === 'asc' ? 'desc' : 'asc') }}>
                    <span className="flex items-center gap-1">Student <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden lg:table-cell">Course</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-slate-700" onClick={() => { setSortField('createdAt'); setSortDir(d => d === 'asc' ? 'desc' : 'asc') }}>
                    <span className="flex items-center gap-1">Date <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs uppercase tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((app, i) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.includes(app.id)} onChange={() => toggleSelect(app.id)} className="w-4 h-4 rounded border-slate-300 text-primary-500" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-primary-600 font-medium cursor-pointer hover:underline" onClick={() => navigate(`/applications/${app.id}`)}>
                        {app.applicationNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(app.studentName)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{app.studentName}</p>
                          <p className="text-xs text-slate-400">{app.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{app.courseName}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500 text-xs">{app.departmentName}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusColor(app.status))}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-400 text-xs">{formatDate(app.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/applications/${app.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} className={cn('w-8 h-8 rounded-lg text-xs font-medium transition-all',
                  page === currentPage ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-100'
                )}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/applications/${app.id}`)}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 card-hover shadow-sm cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                    {getInitials(app.studentName)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{app.studentName}</p>
                    <p className="font-mono text-[10px] text-primary-500">{app.applicationNumber}</p>
                  </div>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', getStatusColor(app.status))}>
                  {getStatusLabel(app.status)}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Course</span>
                  <span className="font-medium text-slate-700">{app.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Department</span>
                  <span className="font-medium text-slate-700">{app.departmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Applied</span>
                  <span className="text-slate-400">{formatDate(app.createdAt)}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">{app.studentPhone}</p>
                <button className="text-xs text-primary-500 font-medium hover:underline flex items-center gap-1">
                  View <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-600 mb-1">No applications found</h3>
          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
