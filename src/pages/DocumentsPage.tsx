import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Search, LayoutGrid, List, FileText, Image, Eye, Download, Check, X, RefreshCw, Upload, Clock, ShieldCheck, AlertCircle, ChevronDown, ChevronUp, File, User, FolderOpen } from 'lucide-react'
import { cn, getStatusColor, getStatusLabel, getDocumentTypeLabel, formatDate, formatFileSize, getInitials } from '@/lib/utils'
import { useDocumentStore } from '@/store/documentStore'
import { useAuthStore } from '@/store/authStore'
import { mockApplications } from '@/data/mockData'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SkeletonRow } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { DocumentStatus, DocumentType, Document, Application } from '@/types'

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  
  const { documents, fetchDocuments, updateDocumentStatus, updateDocument, isLoading } = useDocumentStore()
  const { user } = useAuthStore()
  
  useEffect(() => {
    fetchDocuments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter apps for student role, or all apps that have documents
  const appsWithDocs = useMemo(() => {
    const appMap = new Map<string, any>();
    
    documents.forEach(doc => {
      if (!appMap.has(doc.applicationId)) {
        appMap.set(doc.applicationId, {
          id: doc.applicationId,
          studentName: doc.studentName,
          applicationNumber: doc.applicationId.replace('app_', 'SGI-2026-'),
          appDocs: [],
          total: 0,
          verified: 0,
          pending: 0,
          rejected: 0,
        });
      }
      
      const app = appMap.get(doc.applicationId);
      app.appDocs.push(doc);
      app.total += 1;
      if (doc.status === 'verified') app.verified += 1;
      if (doc.status === 'pending' || doc.status === 'uploaded') app.pending += 1;
      if (doc.status === 'rejected') app.rejected += 1;
    });

    let apps = Array.from(appMap.values());

    // Filter by student role
    if (user?.role === 'student' && user.applicationId) {
      apps = apps.filter(a => a.id === user.applicationId);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      apps = apps.filter(a => a.studentName.toLowerCase().includes(q) || a.applicationNumber.toLowerCase().includes(q));
    }

    return apps.sort((a, b) => b.total - a.total);
  }, [documents, user, searchQuery])

  const filteredApps = useMemo(() => {
    if (!statusFilter) return appsWithDocs;
    return appsWithDocs.filter(app => {
      if (statusFilter === 'pending') return app.pending > 0;
      if (statusFilter === 'verified') return app.verified > 0;
      if (statusFilter === 'rejected') return app.rejected > 0;
      return true;
    });
  }, [appsWithDocs, statusFilter])

  // Stats over all visible apps
  const stats = useMemo(() => ({
    total: appsWithDocs.reduce((acc, app) => acc + app.total, 0),
    verified: appsWithDocs.reduce((acc, app) => acc + app.verified, 0),
    pending: appsWithDocs.reduce((acc, app) => acc + app.pending, 0),
    rejected: appsWithDocs.reduce((acc, app) => acc + app.rejected, 0),
  }), [appsWithDocs])

  const getFileIcon = (type: string) => {
    if (type === 'passport_photos') return Image
    return FileText
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handleDownload = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!doc.fileUrl) return

    const link = document.createElement('a')
    link.href = doc.fileUrl
    link.download = doc.fileName || 'document'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800">Document Tracker</h1>
        <p className="text-sm text-slate-400 mt-0.5">Verify and manage student documents</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Documents', value: stats.total, color: 'bg-primary-50 text-primary-600', icon: FileText },
          { label: 'Verified', value: stats.verified, color: 'bg-emerald-50 text-emerald-600', icon: ShieldCheck },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-600', icon: Clock },
          { label: 'Rejected', value: stats.rejected, color: 'bg-rose-50 text-rose-600', icon: AlertCircle },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', s.color)}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by student name or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none min-w-[150px]">
          <option value="">All Students</option>
          <option value="pending">Has Pending Docs</option>
          <option value="rejected">Has Rejected Docs</option>
          <option value="verified">Has Verified Docs</option>
        </select>
      </div>

      {/* Student List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No students found"
          description={searchQuery || statusFilter ? 'No students match your current filters. Try adjusting your search.' : 'No documents have been uploaded yet.'}
        />
      ) : (
      <div className="space-y-3">
        {filteredApps.map((app, i) => (
          <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
          >
            {/* Row Header */}
            <div 
              onClick={() => toggleExpand(app.id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {getInitials(app.studentName)}
                </div>
                <div
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); navigate(`/applications/${app.id}`); }}
                >
                  <h3 className="font-semibold text-slate-800 hover:text-primary-600 transition-colors">{app.studentName}</h3>
                  <p className="text-xs text-slate-400 font-mono">{app.applicationNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Stats */}
                <div className="flex items-center gap-3 hidden sm:flex">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400">Pending</span>
                    <span className="text-sm font-semibold text-amber-500">{app.pending}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400">Verified</span>
                    <span className="text-sm font-semibold text-emerald-500">{app.verified}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-slate-400">Total</span>
                    <span className="text-sm font-semibold text-slate-700">{app.total}</span>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleExpand(app.id); }}
                  className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2", expandedId === app.id ? "bg-slate-100 text-slate-600" : "bg-primary-50 text-primary-600 hover:bg-primary-100")}
                >
                  {expandedId === app.id ? "Hide Documents" : "Verify"}
                  {expandedId === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Expanded Content (Document Grid) */}
            <AnimatePresence>
              {expandedId === app.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 bg-slate-50/50 overflow-hidden"
                >
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {app.appDocs.map((doc: any, j: number) => {
                      const Icon = getFileIcon(doc.type)
                      return (
                        <div key={doc.id}
                          className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm card-hover cursor-pointer"
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary-500" />
                            </div>
                            <StatusBadge status={doc.status} />
                          </div>
                          <h4 className="font-semibold text-slate-800 text-sm mb-0.5">{getDocumentTypeLabel(doc.type)}</h4>
                          <p className="text-xs text-slate-400 truncate mb-2">{doc.fileName}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                            <span className="flex items-center gap-1"><File className="w-3 h-3" />{formatFileSize(doc.fileSize)}</span>
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">{formatDate(doc.uploadedAt)}</span>
                            <div className="flex items-center gap-1">
                              {/* Preview button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {/* Download button */}
                              {user?.role !== 'student' && (
                                <button
                                  onClick={(e) => handleDownload(doc, e)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {filteredApps.length === 0 && !isLoading && (
          <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            No students found matching your filters.
          </div>
        )}
      </div>
      )}

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setSelectedDoc(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 lg:inset-x-20 lg:inset-y-8 bg-white rounded-2xl shadow-2xl z-50 flex flex-col lg:flex-row overflow-hidden"
            >
              {/* Preview */}
              <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden relative">
                {selectedDoc.fileUrl && selectedDoc.fileUrl.startsWith('data:') ? (
                  selectedDoc.mimeType.startsWith('image/') ? (
                    <img src={selectedDoc.fileUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                  ) : selectedDoc.mimeType === 'application/pdf' ? (
                    <iframe src={selectedDoc.fileUrl} className="w-full h-full rounded-lg shadow-sm border-0 bg-white" title="PDF Preview" />
                  ) : (
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-sm text-slate-500 font-medium">{selectedDoc.fileName}</p>
                      <p className="text-xs text-slate-400 mt-1">Preview not available for this file type</p>
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 font-medium">{selectedDoc.fileName}</p>
                    <p className="text-xs text-slate-400 mt-1">Document Preview</p>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Document Details</h3>
                  <button onClick={() => setSelectedDoc(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4 flex-1 overflow-auto">
                  <div className="space-y-3 text-sm">
                    {[
                      ['Type', getDocumentTypeLabel(selectedDoc.type)],
                      ['Status', getStatusLabel(selectedDoc.status)],
                      ['Student', selectedDoc.studentName],
                      ['Application', selectedDoc.applicationId],
                      ['File Size', formatFileSize(selectedDoc.fileSize)],
                      ['Uploaded', formatDate(selectedDoc.uploadedAt)],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-slate-400">{l}</span>
                        <span className="font-medium text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0 && selectedDoc) {
                        const file = e.target.files[0];
                        if (file.size > 3 * 1024 * 1024) {
                          alert('For this demo, please upload a file smaller than 3MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64Data = reader.result as string;
                          updateDocument(selectedDoc.id, {
                            fileUrl: base64Data,
                            fileName: file.name,
                            fileSize: file.size,
                            mimeType: file.type || 'application/pdf',
                            status: 'pending',
                            uploadedAt: new Date().toISOString()
                          });
                          setSelectedDoc(null);
                        };
                        reader.readAsDataURL(file);
                      }
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }} />
                    {user?.role !== 'student' && selectedDoc.fileUrl && (
                      <button
                        onClick={(e) => handleDownload(selectedDoc, e)}
                        className="w-full py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4" /> Download Document
                      </button>
                    )}
                    {user?.role !== 'student' && selectedDoc.status !== 'verified' && selectedDoc.status !== 'rejected' && (
                      <>
                        <button onClick={() => { updateDocumentStatus(selectedDoc.id, 'verified', user?.name); setSelectedDoc(null); }} className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Approve</button>
                        <button onClick={() => { updateDocumentStatus(selectedDoc.id, 'rejected', user?.name, 'Needs revision'); setSelectedDoc(null); }} className="w-full py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 flex items-center justify-center gap-1.5"><X className="w-4 h-4" /> Reject</button>
                      </>
                    )}
                    {user?.role === 'student' && (
                      <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 flex items-center justify-center gap-1.5"><RefreshCw className="w-4 h-4" /> Resubmit</button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
