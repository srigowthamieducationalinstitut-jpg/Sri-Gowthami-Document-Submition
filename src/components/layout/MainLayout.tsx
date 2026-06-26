import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, FileText, FolderOpen, ShieldCheck, Users, Bell, BarChart3,
  Bot, Settings, ChevronLeft, ChevronRight, GraduationCap, LogOut, Menu, X,
  Search, Sun, Moon, ClipboardList, ChevronDown
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { cn, getInitials, formatRelativeTime } from '@/lib/utils'
import { AIAssistant } from '@/components/ai-assistant/AIAssistant'
import type { UserRole } from '@/types'

// =============================================
// NAV CONFIG
// =============================================
interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  roles: UserRole[]
}

const allRoles: UserRole[] = ['super_admin', 'admission_officer', 'verification_officer', 'student', 'parent']

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: allRoles },
  { label: 'Applications', icon: FileText, path: '/applications', roles: ['super_admin', 'admission_officer'] },
  { label: 'My Application', icon: FileText, path: '/my-application', roles: ['student'] },
  { label: 'Documents', icon: FolderOpen, path: '/documents', roles: ['super_admin', 'admission_officer', 'verification_officer'] },
  { label: 'My Documents', icon: FolderOpen, path: '/my-documents', roles: ['student'] },
  { label: 'Verification', icon: ShieldCheck, path: '/verification', roles: ['super_admin', 'verification_officer'] },
  { label: 'Students', icon: Users, path: '/students', roles: ['super_admin', 'admission_officer'] },
  { label: 'Application Status', icon: ClipboardList, path: '/application-status', roles: ['parent'] },
  { label: 'Notifications', icon: Bell, path: '/notifications', roles: allRoles },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['super_admin', 'admission_officer'] },
  { label: 'Admin', icon: Settings, path: '/admin', roles: ['super_admin'] },
]

// =============================================
// SIDEBAR
// =============================================
function Sidebar() {
  const { sidebarCollapsed, sidebarOpen, setSidebarCollapsed, setSidebarOpen } = useUIStore()
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role))

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-white border-r border-slate-200/80 z-50 flex flex-col',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'max-lg:shadow-xl',
          sidebarOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        )}
        style={{ width: sidebarCollapsed ? 72 : 272 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 shrink-0">
          <img src="/logo.png" className="w-9 h-9 object-contain rounded-lg" alt="Sri Gowthami Logo" />
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h1 className="font-bold text-sm text-slate-800 whitespace-nowrap">Sri Gowthami</h1>
              <p className="text-[10px] text-slate-400 whitespace-nowrap">Educational Institutions</p>
            </motion.div>
          )}
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          <div className="space-y-1">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-500 rounded-r-full"
                    />
                  )}
                  <item.icon className={cn('w-[18px] h-[18px] shrink-0', isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-600')} />
                  {!sidebarCollapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* User & Collapse */}
        <div className="border-t border-slate-100 p-3 space-y-2">
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
          {/* User */}
          <div className={cn('flex items-center gap-3 px-3 py-2 rounded-xl', sidebarCollapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
              {user ? getInitials(user.name) : '?'}
            </div>
            {!sidebarCollapsed && user && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role.replace(/_/g, ' ')}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

// =============================================
// HEADER
// =============================================
function Header() {
  const { sidebarCollapsed, setSidebarOpen, toggleTheme, theme } = useUIStore()
  const { user } = useAuthStore()
  const { notifications } = useNotificationStore()
  const unreadCount = notifications.filter(n => !n.read).length
  const location = useLocation()
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  const pathMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/applications': 'Applications',
    '/documents': 'Documents',
    '/verification': 'Verification',
    '/students': 'Students',
    '/notifications': 'Notifications',
    '/reports': 'Reports',
    '/admin': 'Administration',
    '/my-application': 'My Application',
    '/my-documents': 'My Documents',
    '/application-status': 'Application Status',
  }
  const currentTitle = pathMap[location.pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu */}
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-2 text-sm">
        <span className="text-slate-400">Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-medium text-slate-700">{currentTitle}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showNotifDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                    <span className="text-xs text-primary-500 font-medium cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className={cn('px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50', !n.read && 'bg-primary-50/30')}>
                        <p className="text-sm font-medium text-slate-700">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-300 mt-1">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                    <NavLink to="/notifications" onClick={() => setShowNotifDropdown(false)} className="text-xs text-primary-500 font-medium hover:underline">
                      View all notifications
                    </NavLink>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">{user?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{user?.role.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

// =============================================
// MAIN LAYOUT
// =============================================
export function MainLayout() {
  const { sidebarCollapsed } = useUIStore()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50/50 gradient-mesh">
      <Sidebar />
      <div
        className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarCollapsed ? 72 : 272) : 0 }}
      >
        <Header />
        <main className="p-4 lg:p-6 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AIAssistant />
    </div>
  )
}

export default MainLayout
