import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  User, Mail, Phone, Calendar, BookOpen, Lock, ArrowRight, ArrowLeft,
  GraduationCap, Check, MapPin, Home, Hash, Users, Heart
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import type { User as AppUser, Application } from '@/types'

const steps = ['Personal Info', 'Academic Details', 'Address', 'Personal Details', 'Review & Terms']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Step 1 — Personal Info
    fullName: '', email: '', phone: '', dob: '', gender: 'male',
    password: '', confirmPassword: '',
    // Step 2 — Academic Details
    previousInstitution: '', board: '', percentage: '', courseApplied: '',
    // Step 3 — Address
    street: '', city: '', district: '', state: '', pincode: '',
    // Step 4 — Personal Details
    fatherName: '', fatherPhone: '', motherName: '', motherPhone: '', religion: '',
    // Step 5 — Review & Terms
    agreeTerms: false,
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const { setUser } = useAuthStore()

  const validateStep = (step: number): boolean => {
    setError('')

    if (step === 0) {
      if (!formData.fullName.trim()) { setError('Please enter your full name.'); return false }
      if (!formData.email.trim()) { setError('Please enter your email address.'); return false }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) { setError('Please enter a valid email address.'); return false }
      if (!formData.phone.trim()) { setError('Please enter your phone number.'); return false }
      const phoneRegex = /^[0-9+\s-]{10,15}$/
      if (!phoneRegex.test(formData.phone.trim())) { setError('Please enter a valid phone number (10-15 digits).'); return false }
      if (!formData.dob.trim()) { setError('Please select your date of birth.'); return false }
      if (!formData.password) { setError('Please enter a password.'); return false }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters long.'); return false }
      if (!formData.confirmPassword) { setError('Please confirm your password.'); return false }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return false }
      return true
    }

    if (step === 1) {
      if (!formData.previousInstitution.trim()) { setError('Please enter your previous institution name.'); return false }
      if (!formData.board) { setError('Please select your examination board.'); return false }
      if (!formData.percentage.trim()) { setError('Please enter your percentage.'); return false }
      const percentageVal = parseFloat(formData.percentage)
      if (isNaN(percentageVal) || percentageVal < 0 || percentageVal > 100) {
        setError('Please enter a valid percentage between 0 and 100.'); return false
      }
      if (!formData.courseApplied) { setError('Please select the course you are applying for.'); return false }
      return true
    }

    if (step === 2) {
      if (!formData.street.trim()) { setError('Please enter your street/address.'); return false }
      if (!formData.city.trim()) { setError('Please enter your city.'); return false }
      if (!formData.district.trim()) { setError('Please enter your district.'); return false }
      if (!formData.state.trim()) { setError('Please select your state.'); return false }
      if (!formData.pincode.trim()) { setError('Please enter your pincode.'); return false }
      if (!/^\d{6}$/.test(formData.pincode.trim())) { setError('Please enter a valid 6-digit pincode.'); return false }
      return true
    }

    if (step === 3) {
      if (!formData.fatherName.trim()) { setError("Please enter your father's name."); return false }
      if (!formData.fatherPhone.trim()) { setError("Please enter your father's phone number."); return false }
      const phoneRegex = /^[0-9+\s-]{10,15}$/
      if (!phoneRegex.test(formData.fatherPhone.trim())) { setError("Please enter a valid father's phone number."); return false }
      if (!formData.motherName.trim()) { setError("Please enter your mother's name."); return false }
      if (!formData.motherPhone.trim()) { setError("Please enter your mother's phone number."); return false }
      if (!phoneRegex.test(formData.motherPhone.trim())) { setError("Please enter a valid mother's phone number."); return false }
      if (!formData.religion.trim()) { setError('Please enter your religion.'); return false }
      return true
    }

    if (step === 4) {
      if (!formData.agreeTerms) { setError('You must agree to the Terms of Service and Privacy Policy.'); return false }
      return true
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate all steps before final submit
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        return
      }
    }
    setError('')
    try {
      // Generate a unique student ID — bypasses Firebase Auth so the same
      // email can be used by multiple applicants (e.g., siblings).
      const timestamp = Date.now()
      const rand = Math.random().toString(36).slice(2, 8)
      const generatedUid = `stu_${timestamp}_${rand}`
      const newAppId = `app_${timestamp}_${rand}`

      const courseMap: Record<string, string> = {
        btech_ece: 'B.Tech Electronics & Communication',
        btech_mech: 'B.Tech Mechanical Engineering',
        bba: 'BBA',
        mba: 'MBA',
        mca: 'MCA',
      }
      const courseName = courseMap[formData.courseApplied] || 'B.Tech Computer Science & Engineering'
      const courseIdMap: Record<string, string> = {
        btech_ece: 'crs_002',
        btech_mech: 'crs_003',
        bba: 'crs_004',
        mba: 'crs_004',
        mca: 'crs_005',
      }
      const courseId = courseIdMap[formData.courseApplied] || 'crs_001'

      const newApp: Application = {
        id: newAppId,
        applicationNumber: 'SGI-2026-' + Math.floor(1000 + Math.random() * 9000).toString(),
        studentId: generatedUid,
        studentName: formData.fullName,
        studentEmail: formData.email,
        studentPhone: formData.phone,
        courseId,
        courseName,
        departmentId: 'dept_001',
        departmentName: 'Engineering',
        status: 'submitted',
        personalDetails: {
          fullName: formData.fullName,
          dateOfBirth: formData.dob || '2005-01-01',
          gender: formData.gender as any,
          phone: formData.phone,
          email: formData.email,
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          category: 'general',
          religion: formData.religion,
          nationality: 'Indian',
        },
        academicDetails: {
          previousInstitution: formData.previousInstitution || '',
          board: formData.board || '',
          yearOfPassing: '2026',
          percentage: formData.percentage ? parseFloat(formData.percentage) : 0,
          courseApplied: formData.courseApplied || '',
        },
        address: {
          street: formData.street,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
        },
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const newUser: AppUser = {
        id: generatedUid,
        email: formData.email,
        phone: formData.phone,
        name: formData.fullName,
        role: 'student',
        avatar: '',
        isActive: true,
        applicationId: newAppId,
        // Store password plaintext for demo login lookup.
        // In production, use a proper server-side hash.
        password: formData.password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to Firestore — no Firebase Auth account created,
      // so the same email can be registered multiple times.
      await setDoc(doc(db, 'users', generatedUid), newUser)
      await setDoc(doc(db, 'applications', newAppId), newApp)

      setUser(newUser)
      useAuthStore.setState({ isAuthenticated: true, token: generatedUid, isLoading: false })
      setSuccess(true)
      setTimeout(() => navigate('/my-application'), 2500)
    } catch (err: any) {
      console.error('Registration failed:', err)
      setError(err.message || 'Registration failed. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Successful!</h2>
          <p className="text-slate-400">Redirecting to Admission Portal...</p>
        </motion.div>
      </div>
    )
  }

  // Input class shorthand
  const inputCls = 'w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400'
  const inputNoPadCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400'
  const labelCls = 'block text-sm font-medium text-slate-600 mb-1'

  return (
    <div className="min-h-screen flex">
      {/* Top Left Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 70%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)' }} />
        <motion.div animate={{ y: [-15, 15, -15] }} transition={{ duration: 18, repeat: Infinity }} className="absolute top-24 right-20 w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm" />
        <motion.div animate={{ y: [10, -20, 10] }} transition={{ duration: 14, repeat: Infinity }} className="absolute bottom-40 left-16 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 p-1.5 shadow-md">
            <img src="/logo.png" className="w-full h-full object-contain" alt="Sri Gowthami Logo" />
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Join Sri Gowthami</h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Begin your academic journey with us. Register now and take the first step towards a brighter future.
          </p>
          <div className="mt-12 space-y-4">
            {['Easy online application process', 'Track your admission status in real-time', 'Upload documents from anywhere'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm text-white/90">{item}</span>
              </div>
            ))}
          </div>

          {/* Step indicator on left panel */}
          <div className="mt-12 space-y-2">
            {steps.map((s, i) => (
              <div key={s} className={cn(
                'flex items-center gap-3 text-sm transition-all',
                i < currentStep ? 'text-white/90' : i === currentStep ? 'text-white font-semibold' : 'text-white/40'
              )}>
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0',
                  i < currentStep ? 'bg-white/80 text-emerald-700 border-white/80' :
                  i === currentStep ? 'bg-white text-emerald-600 border-white' :
                  'border-white/30 text-white/40'
                )}>
                  {i < currentStep ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-lg py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo.png" className="w-10 h-10 object-contain rounded-xl" alt="Sri Gowthami Logo" />
            <h1 className="font-bold text-slate-800">Student Registration</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
            {/* Progress */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                      i < currentStep ? 'bg-emerald-500 text-white' :
                      i === currentStep ? 'bg-primary-500 text-white' :
                      'bg-slate-100 text-slate-400'
                    )}>
                      {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={cn(
                      'text-[9px] mt-1.5 font-medium text-center w-14 leading-tight',
                      i <= currentStep ? 'text-primary-600' : 'text-slate-400'
                    )}>
                      {step}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn('w-8 sm:w-12 h-0.5 mx-1 mb-5 transition-colors', i < currentStep ? 'bg-emerald-400' : 'bg-slate-200')} />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">

                {/* ── Step 1: Personal Info ── */}
                {currentStep === 0 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Enter your full name" className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} placeholder="Email" className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={formData.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+91" className={inputCls} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Date of Birth</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="date" value={formData.dob} onChange={e => updateField('dob', e.target.value)} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Gender</label>
                        <select value={formData.gender} onChange={e => updateField('gender', e.target.value)} className={inputNoPadCls + ' appearance-none'}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-sm font-semibold text-slate-700 mb-1">Student Login Credentials</p>
                      <p className="text-xs text-slate-500 mb-3">Create a password to log back into your student account later.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="password" value={formData.password} onChange={e => updateField('password', e.target.value)} placeholder="Create Password" className={inputCls} />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="password" value={formData.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} placeholder="Confirm Password" className={inputCls} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: Academic Details ── */}
                {currentStep === 1 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Details</h3>
                    <div>
                      <label className={labelCls}>Previous Institution</label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={formData.previousInstitution} onChange={e => updateField('previousInstitution', e.target.value)} placeholder="School/College name" className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Board</label>
                        <select value={formData.board} onChange={e => updateField('board', e.target.value)} className={inputNoPadCls + ' appearance-none'}>
                          <option value="">Select Board</option>
                          <option value="BIEAP">BIEAP</option>
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                          <option value="State Board">State Board</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Percentage (%)</label>
                        <input type="number" value={formData.percentage} onChange={e => updateField('percentage', e.target.value)} placeholder="e.g. 85.5" className={inputNoPadCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Course Applied For</label>
                      <select value={formData.courseApplied} onChange={e => updateField('courseApplied', e.target.value)} className={inputNoPadCls + ' appearance-none'}>
                        <option value="">Select Course</option>
                        <option value="btech_cse">B.Tech Computer Science</option>
                        <option value="btech_ece">B.Tech Electronics</option>
                        <option value="btech_mech">B.Tech Mechanical</option>
                        <option value="bba">BBA</option>
                        <option value="mba">MBA</option>
                        <option value="mca">MCA</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: Address ── */}
                {currentStep === 2 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">Address Details</h3>
                    <p className="text-sm text-slate-500 mb-4">Please enter your current residential address.</p>

                    <div>
                      <label className={labelCls}>Street / House No. / Area</label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={formData.street} onChange={e => updateField('street', e.target.value)} placeholder="e.g. 12-A, Gandhi Nagar" className={inputCls} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>City</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={formData.city} onChange={e => updateField('city', e.target.value)} placeholder="e.g. Hyderabad" className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>District</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input value={formData.district} onChange={e => updateField('district', e.target.value)} placeholder="e.g. Rangareddy" className={inputCls} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>State</label>
                        <select value={formData.state} onChange={e => updateField('state', e.target.value)} className={inputNoPadCls + ' appearance-none'}>
                          <option value="">Select State</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Delhi">Delhi</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Pincode</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            maxLength={6}
                            value={formData.pincode}
                            onChange={e => updateField('pincode', e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 500001"
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 4: Personal Details (Parents & Religion) ── */}
                {currentStep === 3 && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">Personal Details</h3>
                    <p className="text-sm text-slate-500 mb-4">Provide your parents' contact details and religion.</p>

                    {/* Father */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Father's Details
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Father's Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              value={formData.fatherName}
                              onChange={e => updateField('fatherName', e.target.value)}
                              placeholder="Father's full name"
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Father's Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="tel"
                              value={formData.fatherPhone}
                              onChange={e => updateField('fatherPhone', e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              className={inputCls}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mother */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Mother's Details
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Mother's Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              value={formData.motherName}
                              onChange={e => updateField('motherName', e.target.value)}
                              placeholder="Mother's full name"
                              className={inputCls}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Mother's Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="tel"
                              value={formData.motherPhone}
                              onChange={e => updateField('motherPhone', e.target.value)}
                              placeholder="+91 XXXXX XXXXX"
                              className={inputCls}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Religion */}
                    <div>
                      <label className={labelCls}>Religion</label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select value={formData.religion} onChange={e => updateField('religion', e.target.value)} className={inputCls + ' appearance-none'}>
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
                  </motion.div>
                )}

                {/* ── Step 5: Review & Terms ── */}
                {currentStep === 4 && (
                  <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Review & Terms</h3>

                    {/* Summary card */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3 text-xs">
                      <p className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">Application Summary</p>
                      {[
                        ['Name', formData.fullName],
                        ['Email', formData.email],
                        ['Phone', formData.phone],
                        ['Course', formData.courseApplied.toUpperCase().replace('_', ' ')],
                        ['Address', `${formData.city}, ${formData.district}, ${formData.state} — ${formData.pincode}`],
                        ["Father's Name", formData.fatherName],
                        ["Mother's Name", formData.motherName],
                        ['Religion', formData.religion],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-slate-400 font-medium">{label}</span>
                          <span className="text-slate-700 font-semibold text-right max-w-[55%] truncate">{value || '—'}</span>
                        </div>
                      ))}
                    </div>

                    <label className="flex items-start gap-3 pt-1 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={e => updateField('agreeTerms', e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                        I agree to the{' '}
                        <a href="#" className="text-primary-500 hover:underline">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>.
                        All information provided is true and correct to the best of my knowledge.
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700">← Back to Login</Link>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 gradient-primary text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                  >
                    Create Account <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
