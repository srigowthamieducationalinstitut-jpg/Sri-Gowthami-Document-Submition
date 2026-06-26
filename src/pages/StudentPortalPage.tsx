import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Upload, FileText, CheckCircle2, Clock,
  GraduationCap, ArrowRight, User, Phone, Mail,
  MapPin, Loader2, Eye, X, RefreshCw, Download, LogOut,
  XCircle, AlertTriangle, Check, Edit3, Save, ChevronDown, Hash, Home, Users, Heart
} from 'lucide-react'
import { cn, getStatusColor, getStatusLabel, getDocumentTypeLabel, formatDate, formatFileSize } from '@/lib/utils'
import { useApplicationStore } from '@/store/applicationStore'
import { useDocumentStore } from '@/store/documentStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

// ─── Document types ─────────────────────────────────────────
const mandatoryDocTypes = [
  'aadhaar', 'marks_memo_10', 'marks_memo_12',
  'tc_10', 'tc_12', 'passport_photo', 'bonafide_10', 'bonafide_12',
] as const

const optionalDocTypes = [
  'migration_certificate', 'rank_card',
  'caste_certificate', 'income_certificate', 'medical_certificate',
] as const

// ─── Helpers ────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')
}

const inputCls =
  'w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all'
const inputNoCls =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all'
const labelCls = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide'

// ─── Profile Edit Drawer ─────────────────────────────────────
interface ProfileDrawerProps {
  open: boolean
  onClose: () => void
  app: any
  user: any
  onSaved: (updates: { name: string; phone: string; email: string }) => void
}

function ProfileDrawer({ open, onClose, app, user, onSaved }: ProfileDrawerProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dob: app?.personalDetails?.dateOfBirth || '',
    gender: app?.personalDetails?.gender || 'male',
    fatherName: app?.personalDetails?.fatherName || '',
    fatherPhone: app?.personalDetails?.fatherPhone || '',
    motherName: app?.personalDetails?.motherName || '',
    motherPhone: app?.personalDetails?.motherPhone || '',
    religion: app?.personalDetails?.religion || '',
    street: app?.address?.street || '',
    city: app?.address?.city || '',
    district: app?.address?.district || '',
    state: app?.address?.state || '',
    pincode: app?.address?.pincode || '',
  })

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setSaved(false)
      setError('')
      setForm({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        dob: app?.personalDetails?.dateOfBirth || '',
        gender: app?.personalDetails?.gender || 'male',
        fatherName: app?.personalDetails?.fatherName || '',
        fatherPhone: app?.personalDetails?.fatherPhone || '',
        motherName: app?.personalDetails?.motherName || '',
        motherPhone: app?.personalDetails?.motherPhone || '',
        religion: app?.personalDetails?.religion || '',
        street: app?.address?.street || '',
        city: app?.address?.city || '',
        district: app?.address?.district || '',
        state: app?.address?.state || '',
        pincode: app?.address?.pincode || '',
      })
    }
  }, [open, user, app])

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setError('')
    if (!form.name.trim()) { setError('Name cannot be empty.'); return }
    if (!/^[0-9+\s-]{10,15}$/.test(form.phone.trim())) { setError('Enter a valid phone number.'); return }
    if (!form.email.trim()) { setError('Email cannot be empty.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Please enter a valid email address.'); return }
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) { setError('Pincode must be 6 digits.'); return }

    setSaving(true)
    try {
      // Update user doc
      if (user?.id) {
        await updateDoc(doc(db, 'users', user.id), {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          updatedAt: new Date().toISOString(),
        })
      }
      // Update application doc
      if (app?.id) {
        await updateDoc(doc(db, 'applications', app.id), {
          studentName: form.name.trim(),
          studentPhone: form.phone.trim(),
          studentEmail: form.email.trim(),
          personalDetails: {
            ...(app.personalDetails || {}),
            fullName: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
            dateOfBirth: form.dob,
            gender: form.gender,
            fatherName: form.fatherName,
            fatherPhone: form.fatherPhone,
            motherName: form.motherName,
            motherPhone: form.motherPhone,
            religion: form.religion,
          },
          address: {
            street: form.street,
            city: form.city,
            district: form.district,
            state: form.state,
            pincode: form.pincode,
          },
          updatedAt: new Date().toISOString(),
        })
      }
      onSaved({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() })
      setSaved(true)
      setTimeout(onClose, 1200)
    } catch (e: any) {
      console.error('Profile save failed:', e)
      setError('Save failed. Changes saved locally only.')
      onSaved({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() })
      setSaved(true)
      setTimeout(onClose, 1400)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-primary-600 to-primary-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">Edit Profile</h2>
                  <p className="text-xs text-white/70">Update your personal information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar block */}
            <div className="px-6 py-5 flex items-center gap-4 bg-slate-50 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
                <span className="text-xl font-bold text-white">{getInitials(form.name || user?.name || 'S')}</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-base">{form.name || user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                  Student
                </span>
              </div>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {error && (
                <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Basic Information
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Your full name" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="Your email address" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Date of Birth</label>
                      <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className={inputNoCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Gender</label>
                      <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputNoCls + ' appearance-none'}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Religion</label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select value={form.religion} onChange={e => set('religion', e.target.value)} className={inputCls + ' appearance-none'}>
                        <option value="">Select Religion</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Jain">Jain</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Street / Area</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={form.street} onChange={e => set('street', e.target.value)} className={inputCls} placeholder="House no., Street, Area" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>City</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} placeholder="City" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>District</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={form.district} onChange={e => set('district', e.target.value)} className={inputCls} placeholder="District" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>State</label>
                      <select value={form.state} onChange={e => set('state', e.target.value)} className={inputNoCls + ' appearance-none'}>
                        <option value="">Select State</option>
                        <option>Andhra Pradesh</option>
                        <option>Telangana</option>
                        <option>Karnataka</option>
                        <option>Tamil Nadu</option>
                        <option>Kerala</option>
                        <option>Maharashtra</option>
                        <option>Gujarat</option>
                        <option>Rajasthan</option>
                        <option>Uttar Pradesh</option>
                        <option>Delhi</option>
                        <option>West Bengal</option>
                        <option>Bihar</option>
                        <option>Madhya Pradesh</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Pincode</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          maxLength={6}
                          value={form.pincode}
                          onChange={e => set('pincode', e.target.value.replace(/\D/g, ''))}
                          className={inputCls}
                          placeholder="6-digit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parents */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Parent / Guardian Details
                </p>
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Father</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Father's Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={form.fatherName} onChange={e => set('fatherName', e.target.value)} className={inputCls} placeholder="Father's name" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Father's Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="tel" value={form.fatherPhone} onChange={e => set('fatherPhone', e.target.value)} className={inputCls} placeholder="Phone" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mother</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Mother's Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={form.motherName} onChange={e => set('motherName', e.target.value)} className={inputCls} placeholder="Mother's name" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Mother's Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="tel" value={form.motherPhone} onChange={e => set('motherPhone', e.target.value)} className={inputCls} placeholder="Phone" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all',
                  saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 disabled:opacity-60'
                )}
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : saved ? (
                  <><Check className="w-4 h-4" /> Saved!</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function StudentPortalPage() {
  const { user, logout, setUser } = useAuthStore()
  const { applications, fetchApplications } = useApplicationStore()
  const { documents, fetchDocuments, addDocument, updateDocument } = useDocumentStore()

  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [agreed, setAgreed] = useState(true)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetRef = useRef<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Local display name — updates immediately on save without full reload
  const [displayName, setDisplayName] = useState(user?.name || '')

  useEffect(() => {
    setDisplayName(user?.name || '')
  }, [user?.name])

  useEffect(() => {
    fetchApplications()
    fetchDocuments()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const app = applications.find(a => a.id === user?.applicationId) || applications[0]
  const localDocs = app ? documents.filter(d => d.applicationId === app.id) : []

  const uploadedMandatoryCount = localDocs.filter(d => mandatoryDocTypes.includes(d.type as any)).length
  const totalDocs = mandatoryDocTypes.length
  const uploadedCount = uploadedMandatoryCount

  const verifiedCount = localDocs.filter(d => d.status === 'verified').length
  const pendingCount = localDocs.filter(d => d.status === 'pending' || d.status === 'uploaded').length
  const rejectedCount = localDocs.filter(d => d.status === 'rejected').length

  const verifiedMandatoryCount = localDocs.filter(
    d => mandatoryDocTypes.includes(d.type as any) && d.status === 'verified'
  ).length
  const isVerificationComplete = verifiedMandatoryCount === totalDocs

  const handleAgreeContinue = () => {
    setAgreed(true)
    try { localStorage.setItem(`sg_agreed_${user?.id}`, 'true') } catch { /* noop */ }
  }

  const handleUploadClick = (type: string) => {
    uploadTargetRef.current = type
    setUploadingType(type)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetType = uploadTargetRef.current
    if (e.target.files && e.target.files.length > 0 && targetType) {
      const file = e.target.files[0]
      if (file.size > 3 * 1024 * 1024) {
        alert('For this demo, please upload a file smaller than 3MB.')
        setUploadingType(null)
        uploadTargetRef.current = null
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Data = reader.result as string
        setTimeout(async () => {
          const existingDoc = localDocs.find(d => d.type === targetType)
          if (existingDoc) {
            await updateDocument(existingDoc.id, {
              fileUrl: base64Data, fileName: file.name, fileSize: file.size,
              mimeType: file.type || 'application/pdf',
              uploadedAt: new Date().toISOString(), status: 'pending',
            })
          } else {
            await addDocument({
              id: `doc_new_${Date.now()}`, applicationId: app.id, studentName: app.studentName,
              type: targetType as any, fileName: file.name, fileUrl: base64Data,
              fileSize: file.size, mimeType: file.type || 'application/pdf',
              comments: [], uploadedAt: new Date().toISOString(), status: 'pending',
            })
          }

          // Trigger live notification for admin/officers
          try {
            const { useNotificationStore } = await import('@/store/notificationStore');
            const docTypeLabel = targetType ? targetType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Document';
            useNotificationStore.getState().addNotification({
              userId: 'admin',
              type: 'warning',
              channel: 'in_app',
              title: existingDoc ? 'Document Resubmitted' : 'Document Submitted',
              message: `${app.studentName} ${existingDoc ? 'resubmitted' : 'submitted'} their ${docTypeLabel} document.`,
              link: `/applications/${app.id}`,
            });
          } catch (err) {
            console.warn('Failed to trigger notification:', err);
          }

          setUploadingType(null)
          uploadTargetRef.current = null
        }, 1200)
      }
      reader.readAsDataURL(file)
    } else {
      setUploadingType(null)
      uploadTargetRef.current = null
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleProfileSaved = ({ name, phone, email }: { name: string; phone: string; email: string }) => {
    setDisplayName(name)
    if (user) {
      setUser({ ...user, name, phone, email })
    }
  }

  const renderDocCard = (type: string) => {
    const docItem = localDocs.find(d => d.type === type)
    const isUploading = uploadingType === type
    const isUploaded = !!docItem
    return (
      <div
        key={type}
        className={cn(
          'p-5 rounded-2xl border transition-all flex flex-col h-full',
          docItem?.status === 'verified' ? 'bg-emerald-50/20 border-emerald-200 shadow-sm' :
          docItem?.status === 'rejected' ? 'bg-rose-50/20 border-rose-200 shadow-sm' :
          docItem?.status === 'pending' || docItem?.status === 'uploaded' ? 'bg-amber-50/20 border-amber-200 shadow-sm' :
          'bg-slate-50/50 border-slate-200/80 border-dashed opacity-80'
        )}
      >
        <div className="flex items-start justify-between mb-3 shrink-0">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', isUploaded ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-400')}>
            <FileText className="w-5 h-5" />
          </div>
          {isUploaded ? (
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase', getStatusColor(docItem.status))}>
              {getStatusLabel(docItem.status)}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 uppercase">Not Uploaded</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-sm">{getDocumentTypeLabel(type)}</h4>
          {isUploaded ? (
            <div className="mt-1.5 space-y-1">
              <p className="text-xs text-slate-500 truncate font-mono">{docItem.fileName}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>{formatFileSize(docItem.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(docItem.uploadedAt)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1">Awaiting copy upload</p>
          )}
          {docItem?.status === 'rejected' && (
            <div className="mt-3 p-2 bg-rose-50 border border-rose-100 text-[11px] text-rose-700 rounded-lg">
              <span className="font-bold">Rejection reason:</span> {docItem.rejectionReason || 'Invalid document.'}
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-end gap-1.5 shrink-0">
          {isUploaded && (
            <button onClick={() => setSelectedDoc(docItem)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors" title="Preview">
              <Eye className="w-4 h-4" />
            </button>
          )}
          {isUploaded && docItem.status !== 'verified' && (
            <button onClick={() => handleUploadClick(type)} disabled={isUploading} className="px-3 py-1.5 bg-white border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50">
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {isUploading ? 'Resubmitting...' : 'Resubmit'}
            </button>
          )}
          {!isUploaded && (
            <button onClick={() => handleUploadClick(type)} disabled={isUploading} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50">
              {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* ── Top Header ── */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="w-10 h-10 object-contain rounded-xl" alt="Sri Gowthami Logo" />
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Sri Gowthami</h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Admissions Portal</p>
          </div>
        </div>

        {/* Right: Student name + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="student-profile-btn"
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-500/20 flex-shrink-0">
              <span className="text-sm font-bold text-white">{getInitials(displayName || 'S')}</span>
            </div>
            {/* Name + role */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight max-w-[140px] truncate">{displayName || 'Student'}</p>
              <p className="text-[10px] text-slate-400 font-medium">Student Account</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', dropdownOpen && 'rotate-180')} />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden z-50"
              >
                {/* Profile card in dropdown */}
                <div className="px-4 py-3.5 bg-gradient-to-br from-primary-50 to-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">{getInitials(displayName || 'S')}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{displayName || 'Student'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Edit Profile */}
                <button
                  id="edit-profile-menu-item"
                  onClick={() => { setDropdownOpen(false); setProfileOpen(true) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center transition-colors">
                    <Edit3 className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                  <span className="font-medium">Edit Profile</span>
                </button>

                <div className="h-px bg-slate-100 mx-4" />

                {/* Sign Out */}
                <button
                  id="sign-out-menu-item"
                  onClick={() => { setDropdownOpen(false); logout(); window.location.href = '/' }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center transition-colors">
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <span className="font-medium">Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Profile Edit Drawer ── */}
      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        app={app}
        user={user}
        onSaved={handleProfileSaved}
      />

      {/* ── Main Content ── */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!agreed ? (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xl max-w-3xl mx-auto"
            >
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Admissions & Document Upload Instructions</h2>
              <div className="space-y-4 text-slate-600 mb-8 leading-relaxed">
                <p>Welcome to the Sri Gowthami Admissions Portal! To confirm your seat, you need to provide clear digital copies of your original academic and personal documents.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Scan or take high-resolution, clear photos of all required documents.</li>
                  <li>Files must be in PDF, JPG, or PNG format and under 3MB each.</li>
                  <li>Our verification team will review each upload. If any document is rejected, you will be notified on your dashboard with an option to resubmit immediately.</li>
                </ul>
                <p className="font-semibold text-slate-800 p-4 bg-amber-50 rounded-xl border border-amber-100/80 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Important: Providing false information or forged documents will lead to immediate cancellation of your admission registration.</span>
                </p>
              </div>
              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors mb-8">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-slate-700 font-medium">
                  I have read and understood the instructions. I agree to upload authentic documents for registration.
                </span>
              </label>
              <button onClick={handleAgreeContinue} disabled={!agreed} className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                Continue to Student Dashboard <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Status Alert Banner */}
              <div className="w-full">
                {app.status === 'approved' || app.status === 'admission_completed' ? (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">Congratulations! You are Qualified</h2>
                      </div>
                      <p className="text-emerald-50 text-sm mt-2 max-w-2xl">
                        Your documents have been verified, and your admission to {app.courseName} has been officially confirmed!
                      </p>
                    </div>
                  </div>
                ) : app.status === 'rejected' ? (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-2xl flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-base">Application Status: Rejected</h3>
                      <p className="text-sm text-rose-600 mt-1">We regret to inform you that your application has been rejected by the admissions committee.</p>
                      {app.rejectionReason && (
                        <p className="text-xs font-semibold bg-rose-100/50 p-2.5 rounded-lg text-rose-800 mt-3 border border-rose-200/40">
                          <strong>Reason:</strong> {app.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                ) : rejectedCount > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-base">Action Required: Resubmission Needed</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        We found some issues with your uploaded documents. Please review the checklist below, find the items marked as Rejected, and resubmit the correct files to resume verification.
                      </p>
                    </div>
                  </div>
                ) : uploadedCount === totalDocs ? (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-5 rounded-2xl flex items-start gap-4">
                    <Clock className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-base">Application Under Review</h3>
                      <p className="text-sm text-blue-600 mt-1">All required documents have been uploaded successfully. Our verification officers are currently reviewing them.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100 border border-slate-200 text-slate-700 p-5 rounded-2xl flex items-start gap-4">
                    <Upload className="w-6 h-6 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-base">Incomplete Application Documents</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        You have uploaded {uploadedCount} of {totalDocs} required documents. Please upload the remaining documents to start the verification process.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Main Column */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Required', value: totalDocs, color: 'bg-primary-50 text-primary-700' },
                      { label: 'Verified', value: verifiedCount, color: 'bg-emerald-50 text-emerald-700' },
                      { label: 'Pending Review', value: pendingCount, color: 'bg-amber-50 text-amber-700' },
                      { label: 'Rejected', value: rejectedCount, color: rejectedCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-50 text-slate-400' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm text-center">
                        <p className={cn('text-2xl font-bold rounded-xl py-1 inline-block px-3.5', s.color)}>{s.value}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-2">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Document Checklist */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">Documents Checklist</h3>
                        <p className="text-sm text-slate-500">Provide and manage digital copies of your requirements</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">{uploadedCount} / {totalDocs} Mandatory</span>
                    </div>

                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

                    <div className="space-y-8">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Mandatory Documents ({mandatoryDocTypes.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {mandatoryDocTypes.map(renderDocCard)}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100/60">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Optional Documents ({optionalDocTypes.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {optionalDocTypes.map(renderDocCard)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Stepper */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-sm mb-4">Admissions Status Tracker</h3>
                    <div className="relative ml-4">
                      <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-slate-100" />
                      {[
                        { title: 'Account Registered', desc: 'Successfully created credentials', isCompleted: true, isCurrent: false },
                        { title: 'Upload Documents', desc: `${uploadedCount} of ${totalDocs} requirements provided`, isCompleted: uploadedCount === totalDocs, isCurrent: uploadedCount < totalDocs },
                        { title: 'Document Verification', desc: `${verifiedCount} of ${uploadedCount} approved by officers`, isCompleted: isVerificationComplete, isCurrent: uploadedCount === totalDocs && !isVerificationComplete },
                        {
                          title: 'Admission Result',
                          desc: app.status === 'approved' || app.status === 'admission_completed' ? 'Qualified & Admitted' : app.status === 'rejected' ? 'Not Confirmed' : 'Review Decision Pending',
                          isCompleted: app.status === 'approved' || app.status === 'admission_completed',
                          isCurrent: isVerificationComplete && app.status === 'submitted',
                          isFailed: app.status === 'rejected',
                        },
                      ].map((step, i) => (
                        <div key={i} className="relative pl-7 pb-6 last:pb-0">
                          <div className={cn(
                            'absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full border flex items-center justify-center',
                            step.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                            (step as any).isFailed ? 'bg-rose-500 border-rose-500 text-white' :
                            step.isCurrent ? 'bg-white border-primary-500 text-primary-500 shadow-sm' :
                            'bg-white border-slate-200 text-slate-300'
                          )}>
                            {step.isCompleted ? <Check className="w-3.5 h-3.5" /> :
                             (step as any).isFailed ? <X className="w-3.5 h-3.5" /> :
                             <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                          </div>
                          <div>
                            <h4 className={cn('text-xs font-bold leading-tight', step.isCompleted || step.isCurrent ? 'text-slate-800' : 'text-slate-400')}>
                              {step.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Registration Summary */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-800 text-sm">Registration Summary</h3>
                      <button
                        onClick={() => setProfileOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      {[
                        ['Student Name', displayName || app.studentName],
                        ['Registered Email', app.studentEmail],
                        ['Mobile Number', user?.phone || app.studentPhone],
                        ['Applied Course', app.courseName],
                        ['Department', app.departmentName],
                        ['Application ID', app.applicationNumber],
                        ['Registration Date', formatDate(app.createdAt)],
                      ].map(([l, v]) => (
                        <div key={l} className="flex justify-between border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0">
                          <span className="text-slate-400 font-medium">{l}</span>
                          <span className="font-semibold text-slate-700 text-right">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Document Viewer Modal ── */}
      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setSelectedDoc(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 lg:inset-x-20 lg:inset-y-8 bg-white rounded-2xl shadow-2xl z-50 flex flex-col lg:flex-row overflow-hidden"
            >
              <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-hidden relative">
                {selectedDoc.fileUrl && selectedDoc.fileUrl.startsWith('data:') ? (
                  selectedDoc.mimeType.startsWith('image/') ? (
                    <img src={selectedDoc.fileUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                  ) : selectedDoc.mimeType === 'application/pdf' ? (
                    <iframe src={selectedDoc.fileUrl} className="w-full h-full rounded-lg shadow-sm border-0 bg-white" title="PDF Preview" />
                  ) : (
                    <div className="text-center"><FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-sm text-slate-500 font-medium">{selectedDoc.fileName}</p></div>
                  )
                ) : (
                  <div className="text-center"><FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-sm text-slate-500 font-medium">{selectedDoc.fileName}</p></div>
                )}
              </div>
              <div className="w-full lg:w-[320px] bg-white border-l border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 text-sm">Document Preview</h3>
                  <button onClick={() => setSelectedDoc(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 flex-1 overflow-auto space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Verification Status</p>
                    <span className={cn('px-3 py-1 rounded-lg text-xs font-bold inline-block', getStatusColor(selectedDoc.status))}>
                      {getStatusLabel(selectedDoc.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Metadata Information</p>
                    <div className="space-y-3 text-xs text-slate-700">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400 font-medium">Type</span>
                        <span className="font-semibold">{getDocumentTypeLabel(selectedDoc.type)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-400 font-medium">File Size</span>
                        <span className="font-semibold">{formatFileSize(selectedDoc.fileSize)}</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-slate-400 font-medium">Uploaded Date</span>
                        <span className="font-semibold">{formatDate(selectedDoc.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <a href={selectedDoc.fileUrl} download={selectedDoc.fileName} className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download File
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
