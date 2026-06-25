import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, Shield, UserCheck, User, Users, ArrowLeft, KeyRound, AlertCircle, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const quickLogins = [
  { label: 'Admissions', email: 'admissions@srigowthami.edu.in', icon: UserCheck, color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' },
  { label: 'Verifier', email: 'verify@srigowthami.edu.in', icon: User, color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' },
  { label: 'Student', email: 'student@example.com', icon: Users, color: 'bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100' },
]

interface FieldErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, sendOtp, loginWithOtp, resetPassword } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // --- States for OTP / Password Reset flow ---
  const [authMode, setAuthMode] = useState<'login' | 'otp_request' | 'otp_verify' | 'reset_password'>('login')
  const [otpFlowType, setOtpFlowType] = useState<'login' | 'reset'>('login')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [demoStudentName, setDemoStudentName] = useState('')
  const [otpUserId, setOtpUserId] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSuccess, setOtpSuccess] = useState('')

  const validateFields = (): boolean => {
    const errors: FieldErrors = {}

    if (!email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password.trim()) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateFields()) return

    setIsLoading(true)
    try {
      const success = await login(email, password || 'Test@1234')
      if (success) {
        const userRole = useAuthStore.getState().user?.role
        navigate(userRole === 'student' ? '/my-application' : '/dashboard')
      } else {
        setError('Invalid email or password.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (emailAddr: string) => {
    setEmail(emailAddr)
    setError('')
    setFieldErrors({})
    setIsLoading(true)
    const success = await login(emailAddr, 'Test@1234')
    setIsLoading(false)
    if (success) {
      const userRole = useAuthStore.getState().user?.role
      navigate(userRole === 'student' ? '/my-application' : '/dashboard')
    }
  }

  const handleOtpRequest = async (e: React.FormEvent, flow: 'login' | 'reset') => {
    e.preventDefault()
    setOtpError('')
    setOtpSuccess('')

    if (!otpEmail.trim()) {
      setOtpError('Email address is required')
      return
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      setOtpError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    try {
      const res = await sendOtp(otpEmail)
      if (res.success) {
        setOtpFlowType(flow)
        setGeneratedOtp(res.otp || '')
        setDemoStudentName(res.studentName || '')
        setOtpUserId(res.userId || '')
        setOtpSuccess(res.message)
        setTimeout(() => {
          setAuthMode('otp_verify')
          setOtpSuccess('')
        }, 1200)
      } else {
        setOtpError(res.message)
      }
    } catch (err) {
      setOtpError('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError('')
    setOtpSuccess('')

    if (!otpCode.trim()) {
      setOtpError('OTP code is required')
      return
    } else if (otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }

    if (otpCode !== generatedOtp) {
      setOtpError('Invalid OTP code. Please try again.')
      return
    }

    setIsLoading(true)
    try {
      if (otpFlowType === 'login') {
        const success = await loginWithOtp(otpUserId)
        if (success) {
          setOtpSuccess('Verification successful! Logging in...')
          setTimeout(() => {
            navigate('/my-application')
          }, 1500)
        } else {
          setOtpError('Failed to log in. Please try again.')
        }
      } else {
        setOtpSuccess('OTP verified successfully!')
        setTimeout(() => {
          setAuthMode('reset_password')
          setOtpSuccess('')
        }, 1200)
      }
    } catch {
      setOtpError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError('')
    setOtpSuccess('')

    if (!newPassword.trim()) {
      setOtpError('Password is required')
      return
    } else if (newPassword.length < 6) {
      setOtpError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setOtpError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const success = await resetPassword(otpUserId, newPassword)
      if (success) {
        setOtpSuccess('Password updated successfully! Logging you in...')
        await loginWithOtp(otpUserId)
        setTimeout(() => {
          navigate('/my-application')
        }, 2000)
      } else {
        setOtpError('Failed to reset password. Please try again.')
      }
    } catch {
      setOtpError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex">
      {/* Top Left Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)'
        }} />

        {/* Floating shapes */}
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 left-20 w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [20, -30, 20], x: [-10, 10, -10] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-32 right-20 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [10, -20, 10] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/3 w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-sm rotate-45"
        />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 p-1.5 shadow-md">
              <img src="/logo.png" className="w-full h-full object-contain" alt="Sri Gowthami Logo" />
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Sri Gowthami<br />Educational Institutions
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              Empowering Education, Shaping Futures. Manage student admissions with our modern, centralized platform.
            </p>
            <div className="mt-12 flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">1,200+</p>
                <p className="text-xs text-white/60 mt-1">Students</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-bold">50+</p>
                <p className="text-xs text-white/60 mt-1">Courses</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-3xl font-bold">98%</p>
                <p className="text-xs text-white/60 mt-1">Approval Rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo.png" className="w-10 h-10 object-contain rounded-xl" alt="Sri Gowthami Logo" />
            <div>
              <h1 className="font-bold text-slate-800">Sri Gowthami</h1>
              <p className="text-xs text-slate-400">Educational Institutions</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
            {/* Headers */}
            {authMode === 'login' && (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
                <p className="text-sm text-slate-400 mb-8">Sign in to your account to continue</p>
              </>
            )}
            {authMode === 'otp_request' && (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Forgot Password</h2>
                <p className="text-sm text-slate-400 mb-8">Enter your student email to request a login or reset OTP</p>
              </>
            )}
            {authMode === 'otp_verify' && (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Verify OTP</h2>
                <p className="text-sm text-slate-400 mb-8">Enter the 6-digit OTP code sent to your email</p>
              </>
            )}
            {authMode === 'reset_password' && (
              <>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Reset Password</h2>
                <p className="text-sm text-slate-400 mb-8">Create a new secure password for your student account</p>
              </>
            )}

            {/* Error & Success alerts */}
            {authMode === 'login' && error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
                {error}
              </motion.div>
            )}

            {authMode !== 'login' && otpError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{otpError}</span>
              </motion.div>
            )}

            {authMode !== 'login' && otpSuccess && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600 flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{otpSuccess}</span>
              </motion.div>
            )}

            {/* ── Form 1: Standard Password Login ── */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined })) }}
                      placeholder="Enter your email"
                      className={cn(
                        'w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                        fieldErrors.email
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                          : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-400'
                      )}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined })) }}
                      placeholder="Enter your password"
                      className={cn(
                        'w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                        fieldErrors.password
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                          : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-400'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpEmail(email)
                      setOtpError('')
                      setOtpSuccess('')
                      setAuthMode('otp_request')
                    }}
                    className="text-sm text-primary-500 hover:text-primary-600 font-medium bg-transparent border-0 cursor-pointer p-0"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'w-full py-3 gradient-primary text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300',
                    isLoading && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Sign In <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}

            {/* ── Form 2: Request OTP ── */}
            {authMode === 'otp_request' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Registered Student Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="e.g. student@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(e) => handleOtpRequest(e, 'login')}
                    className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/25 transition-all"
                  >
                    {isLoading && otpFlowType === 'login' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Log In Directly with OTP <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(e) => handleOtpRequest(e, 'reset')}
                    className="w-full py-3 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-slate-800/25 transition-all"
                  >
                    {isLoading && otpFlowType === 'reset' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Verify OTP & Reset Password <KeyRound className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="w-full text-center text-sm text-slate-500 hover:text-slate-700 font-medium py-1"
                >
                  ← Back to Password Login
                </button>
              </div>
            )}

            {/* ── Form 3: Verify OTP ── */}
            {authMode === 'otp_verify' && (
              <form onSubmit={handleOtpVerify} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Enter 6-Digit OTP</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all font-mono text-center tracking-widest text-lg font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 gradient-primary text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Verify Code & {otpFlowType === 'login' ? 'Log In' : 'Proceed'} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <div className="flex justify-between text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => setAuthMode('otp_request')}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleOtpRequest(e, otpFlowType)}
                    className="text-primary-500 hover:text-primary-600"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* ── Form 4: Reset Password ── */}
            {authMode === 'reset_password' && (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-600/25 transition-all"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Update Password & Log In <Check className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            )}

            {authMode === 'login' && (
              <p className="text-center text-sm text-slate-400 mt-6">
                New student?{' '}
                <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">Register here</Link>
              </p>
            )}
          </div>

          {/* Quick Login */}
          {authMode === 'login' && (
            <div className="mt-6">
              <p className="text-xs text-slate-400 text-center mb-3 font-medium uppercase tracking-wider">Quick Demo Login</p>
              <div className="grid grid-cols-3 gap-2">
                {quickLogins.map((q) => (
                  <motion.button
                    key={q.email}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickLogin(q.email)}
                    className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all', q.color)}
                  >
                    <q.icon className="w-4 h-4" />
                    {q.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
