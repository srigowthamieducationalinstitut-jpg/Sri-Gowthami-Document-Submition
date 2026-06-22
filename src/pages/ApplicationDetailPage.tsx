import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft, Check, X, Printer, FileText, Clock, User, MapPin,
  GraduationCap, Calendar, Phone, Mail, Shield, ChevronRight, CheckCircle2,
  AlertCircle, Upload, MessageSquare, Eye, Download, File, Send
} from 'lucide-react'
import { cn, getStatusColor, getStatusLabel, formatDate, getDocumentTypeLabel, getInitials, formatFileSize } from '@/lib/utils'
import { useApplicationStore } from '@/store/applicationStore'
import { useDocumentStore } from '@/store/documentStore'
import { useAuthStore } from '@/store/authStore'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SkeletonGrid } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { DocumentType } from '@/types'

const tabs = ['Overview', 'Documents', 'Timeline', 'Notes']

const MANDATORY_DOC_TYPES: DocumentType[] = [
  'aadhaar',
  'marks_memo_10',
  'marks_memo_12',
  'tc_10',
  'tc_12',
  'passport_photo',
  'bonafide_10',
  'bonafide_12',
]

const OPTIONAL_DOC_TYPES: DocumentType[] = [
  'migration_certificate',
  'rank_card',
  'caste_certificate',
  'income_certificate',
  'medical_certificate',
]

const ALL_DOC_TYPES = [...MANDATORY_DOC_TYPES, ...OPTIONAL_DOC_TYPES]

const timelineEvents = [
  { title: 'Application Created', desc: 'Student submitted initial application', status: 'completed' as const, date: '2026-05-15', icon: FileText },
  { title: 'Documents Uploaded', desc: '5 of 8 documents uploaded', status: 'completed' as const, date: '2026-05-18', icon: Upload },
  { title: 'Verification Started', desc: 'Assigned to Suresh Reddy for review', status: 'completed' as const, date: '2026-05-20', icon: Shield },
  { title: 'Pending Documents', desc: 'Transfer Certificate requires resubmission', status: 'current' as const, date: '2026-05-21', icon: AlertCircle },
  { title: 'Documents Approved', desc: 'All documents verified and approved', status: 'pending' as const, date: '', icon: CheckCircle2 },
  { title: 'Application Approved', desc: 'Final approval by admission officer', status: 'pending' as const, date: '', icon: Check },
  { title: 'Admission Completed', desc: 'Student enrolled successfully', status: 'pending' as const, date: '', icon: GraduationCap },
]

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')
  const [commentText, setCommentText] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  const { applications, fetchApplications, selectedApplication, updateStatus } = useApplicationStore()
  const { documents, fetchDocuments, updateDocumentStatus, addComment, isLoading: docsLoading } = useDocumentStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchApplications()
    fetchDocuments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const app = applications.find(a => a.id === id) || selectedApplication
  const docs = app ? documents.filter(d => d.applicationId === app.id) : []

  // Stats
  const verifiedCount = docs.filter(d => d.status === 'verified').length
  const pendingCount = docs.filter(d => d.status === 'pending' || d.status === 'uploaded').length
  const totalCount = docs.length

  // Map docs by type for checklist
  const docsByType = new Map(docs.map(d => [d.type, d]))

  const isOfficerOrAdmin = user?.role === 'super_admin' ||
    user?.role === 'admission_officer' ||
    user?.role === 'verification_officer'

  const handleApproveAll = async () => {
    if (!app) return
    const now = new Date().toISOString()
    const unverifiedDocs = docs.filter(d => d.status !== 'verified')
    
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      for (const d of unverifiedDocs) {
        await updateDoc(doc(db, 'documents', d.id), {
          status: 'verified',
          verifiedAt: now,
          verifiedBy: user?.name || 'Admission Officer'
        })
      }
    } catch (err) {
      console.error('Failed to verify all documents quietly in database:', err)
    }
    
    await updateStatus(app.id, 'approved')
  }

  const handleVerify = (docId: string) => {
    updateDocumentStatus(docId, 'verified', user?.name)
  }

  const handleReject = async (targetId: string) => {
    if (!app) return
    if (targetId === 'application') {
      await updateStatus(app.id, 'rejected', rejectReason || 'Application rejected')
    } else {
      await updateDocumentStatus(targetId, 'rejected', user?.name, rejectReason || 'Needs revision')
    }
    setShowRejectModal(null)
    setRejectReason('')
  }

  const handleAddComment = (docId: string) => {
    if (!commentText.trim() || !user) return
    addComment(docId, {
      documentId: docId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      content: commentText.trim(),
    })
    setCommentText('')
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1" />
        {isOfficerOrAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={handleApproveAll} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 flex items-center gap-1.5 transition-colors">
              <Check className="w-4 h-4" /> Approve All
            </button>
            <button onClick={() => setShowRejectModal('application')} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 flex items-center gap-1.5 transition-colors">
              <X className="w-4 h-4" /> Reject
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        )}
      </motion.div>

      {/* App Header Card — Student Info + Counts */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold">
            {getInitials(app.studentName)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-800">{app.studentName}</h2>
              <StatusBadge status={app.status} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400 flex-wrap">
              <span className="font-mono text-primary-500 font-medium">{app.applicationNumber}</span>
              <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {app.courseName}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(app.createdAt)}</span>
            </div>
          </div>

          {/* Document Counts */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex flex-col items-center px-4 py-2 bg-amber-50 rounded-xl">
              <span className="text-lg font-bold text-amber-600">{pendingCount}</span>
              <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wide">Pending</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-emerald-50 rounded-xl">
              <span className="text-lg font-bold text-emerald-600">{verifiedCount}</span>
              <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wide">Verified</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-xl">
              <span className="text-lg font-bold text-slate-600">{totalCount}</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Total</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-500" /> Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Full Name', app.personalDetails?.fullName || app.studentName],
                ['Date of Birth', app.personalDetails?.dateOfBirth || '2005-06-15'],
                ['Gender', app.personalDetails?.gender || 'Male'],
                ['Phone', app.personalDetails?.phone || app.studentPhone],
                ['Email', app.personalDetails?.email || app.studentEmail],
                ['Father\'s Name', app.personalDetails?.fatherName || 'N/A'],
                ['Father\'s Phone', app.personalDetails?.fatherPhone || 'N/A'],
                ['Mother\'s Name', app.personalDetails?.motherName || 'N/A'],
                ['Mother\'s Phone', app.personalDetails?.motherPhone || 'N/A'],
                ['Religion', app.personalDetails?.religion || 'N/A'],
                ['Category', app.personalDetails?.category || 'General'],
                ['Nationality', app.personalDetails?.nationality || 'Indian'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="font-medium text-slate-700 capitalize">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Academic Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-500" /> Academic Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Previous Institution', app.academicDetails?.previousInstitution || 'Sri Chaitanya Jr. College'],
                ['Board', app.academicDetails?.board || 'BIEAP'],
                ['Year of Passing', app.academicDetails?.yearOfPassing || '2026'],
                ['Percentage', `${app.academicDetails?.percentage || 85}%`],
                ['Course Applied', app.courseName],
                ['Department', app.departmentName],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="font-medium text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Address */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" /> Address
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                ['Street', app.address?.street || 'D.No 12-5-78, Main Road'],
                ['City', app.address?.city || 'Rajahmundry'],
                ['District', app.address?.district || 'East Godavari'],
                ['State', app.address?.state || 'Andhra Pradesh'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="font-medium text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="space-y-6">
          {/* Document Checklist Grid — all 8 types */}
          {docsLoading ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ALL_DOC_TYPES.map((docType, i) => {
                const doc = docsByType.get(docType)
                const isUploaded = !!doc

                return (
                  <motion.div
                    key={docType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'bg-white rounded-2xl border p-5 shadow-sm flex flex-col h-full',
                      isUploaded ? 'border-slate-200/60 card-hover' : 'border-dashed border-slate-300 opacity-70'
                    )}
                  >
                    {/* Top: icon + badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        isUploaded ? 'bg-primary-50' : 'bg-slate-100'
                      )}>
                        <FileText className={cn('w-5 h-5', isUploaded ? 'text-primary-500' : 'text-slate-300')} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                          MANDATORY_DOC_TYPES.includes(docType) 
                            ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        )}>
                          {MANDATORY_DOC_TYPES.includes(docType) ? 'Mandatory' : 'Optional'}
                        </span>
                        {isUploaded ? (
                          <StatusBadge status={doc.status} />
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-400">
                            Not Uploaded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <h4 className="font-semibold text-slate-800 text-sm mb-0.5">
                      {getDocumentTypeLabel(docType)}
                    </h4>

                    {isUploaded ? (
                      <>
                        <p className="text-xs text-slate-400 truncate mb-1">{doc.fileName}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                          <span className="flex items-center gap-1"><File className="w-3 h-3" />{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploadedAt)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 mb-3 flex-1">
                        Awaiting upload from student
                      </p>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Action buttons */}
                    {isUploaded && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        {/* Preview + Download row */}
                        <div className="flex items-center gap-1.5">
                          <button
                            className="flex-1 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <button
                            className="flex-1 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>

                        {/* Verify + Reject buttons — visible only to officers */}
                        {isOfficerOrAdmin && doc.status !== 'verified' && doc.status !== 'rejected' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerify(doc.id)}
                              className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Verify
                            </button>
                            <button
                              onClick={() => setShowRejectModal(doc.id)}
                              className="flex-1 py-2 text-xs font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Comment History Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
          >
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-500" /> Comment History
            </h3>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {docs.flatMap(d => d.comments.map(c => ({ ...c, docType: d.type }))).length > 0 ? (
                docs.flatMap(d => d.comments.map(c => ({ ...c, docType: d.type })))
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(comment.userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-medium text-sm text-slate-700">{comment.userName}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{comment.userRole.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-slate-300">on {getDocumentTypeLabel(comment.docType)}</span>
                          <span className="text-[10px] text-slate-300">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-600">{comment.content}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No comments yet.</p>
              )}
            </div>
            {isOfficerOrAdmin && docs.length > 0 && (
              <div className="flex gap-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment on the first document..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  onKeyDown={(e) => { if (e.key === 'Enter' && docs[0]) handleAddComment(docs[0].id) }}
                />
                <button
                  onClick={() => { if (docs[0]) handleAddComment(docs[0].id) }}
                  disabled={!commentText.trim()}
                  className="px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {activeTab === 'Timeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-6">Application Lifecycle</h3>
          <div className="relative ml-6">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200" />
            {timelineEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-8 pb-8 last:pb-0"
              >
                <div className={cn('absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center border-2',
                  event.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                  event.status === 'current' ? 'bg-white border-primary-500 text-primary-500' :
                  'bg-white border-slate-200 text-slate-300'
                )}>
                  <event.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={cn('font-semibold text-sm', event.status === 'pending' ? 'text-slate-400' : 'text-slate-800')}>
                    {event.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{event.desc}</p>
                  {event.date && <p className="text-xs text-slate-300 mt-1">{formatDate(event.date)}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'Notes' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary-500" /> Internal Notes
          </h3>
          <div className="space-y-4 mb-6">
            {[
              { user: 'Priya Sharma', role: 'Admission Officer', note: 'Student has excellent academics. Fast-track verification recommended.', date: '2026-05-18' },
              { user: 'Suresh Reddy', role: 'Verification Officer', note: 'TC needs correction — school name mismatch. Requested resubmission.', date: '2026-05-21' },
            ].map((n, i) => (
              <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(n.user)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-slate-700">{n.user}</span>
                    <span className="text-[10px] text-slate-400">{n.role}</span>
                    <span className="text-[10px] text-slate-300">{formatDate(n.date)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{n.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <input placeholder="Add a note..." className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            <button className="px-4 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium flex items-center gap-1.5">
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </motion.div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowRejectModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
              <h3 className="font-semibold text-slate-800 mb-4">
                {showRejectModal === 'application' ? 'Reject Application' : 'Rejection Reason'}
              </h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={
                  showRejectModal === 'application'
                    ? "Enter the reason for rejecting this application..."
                    : "Enter the reason for rejecting this document..."
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                rows={3}
              />
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setShowRejectModal(null)}
                  className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors"
                >
                  {showRejectModal === 'application' ? 'Reject Application' : 'Reject Document'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
