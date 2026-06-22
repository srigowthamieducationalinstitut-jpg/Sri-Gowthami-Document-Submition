import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, Shield, UserCheck, User, Users, ArrowLeft } from 'lucide-react'
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
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

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
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
              <GraduationCap className="w-9 h-9" />
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
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Sri Gowthami</h1>
              <p className="text-xs text-slate-400">Educational Institutions</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome Back</h2>
            <p className="text-sm text-slate-400 mb-8">Sign in to your account to continue</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600">
                {error}
              </motion.div>
            )}

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
                <a href="#" className="text-sm text-primary-500 hover:text-primary-600 font-medium">Forgot password?</a>
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

            <p className="text-center text-sm text-slate-400 mt-6">
              New student?{' '}
              <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">Register here</Link>
            </p>
          </div>

          {/* Quick Login */}
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
        </motion.div>
      </div>
    </div>
  )
}
