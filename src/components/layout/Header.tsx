// ============================================
// Header — Top Bar with Search, Notifications & Profile
// ============================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Search,
  Command,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Check,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { cn, getInitials, formatRelativeTime } from '@/lib/utils';

// ─── Breadcrumb Label Map ────────────────────
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  'my-application': 'My Application',
  documents: 'Documents',
  'my-documents': 'My Documents',
  verification: 'Verification',
  students: 'Students',
  'application-status': 'Application Status',
  notifications: 'Notifications',
  reports: 'Reports',

  admin: 'Admin',
  settings: 'Settings',
  profile: 'Profile',
};

export function Header() {
  const { setSidebarOpen, theme, toggleTheme, setCommandPaletteOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchFocused, setSearchFocused] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // ─── Breadcrumbs ───────────────────────────
  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => ({
      label: routeLabels[segment] ?? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      path: segment,
    }));

  // ─── Cmd+K Shortcut ───────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  // ─── Click Outside Handlers ────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    setProfileDropdownOpen(false);
    logout();
  }, [logout]);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl backdrop-saturate-150 md:px-6">
      {/* ─── Left Section ─────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Breadcrumb">
          <span className="font-medium text-slate-400">Home</span>
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.path} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span
                className={cn(
                  'font-medium',
                  i === breadcrumbs.length - 1
                    ? 'text-slate-800'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* ─── Center: Search Bar ───────────────── */}
      <div className="mx-4 hidden max-w-md flex-1 md:block lg:max-w-lg">
        <motion.div
          className={cn(
            'relative flex items-center rounded-xl border bg-slate-50/80 transition-all duration-300',
            searchFocused
              ? 'border-blue-300 bg-white shadow-sm shadow-blue-100 ring-4 ring-blue-50'
              : 'border-slate-200/80 hover:border-slate-300'
          )}
          animate={searchFocused ? { scale: 1.01 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Search className="ml-3.5 h-4 w-4 shrink-0 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search applications, students, documents..."
            className="h-9 w-full bg-transparent px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onClick={() => setCommandPaletteOpen(true)}
            readOnly
          />
          <div className="mr-2.5 flex shrink-0 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5">
            <Command className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-400">K</span>
          </div>
        </motion.div>
      </div>

      {/* Mobile Search Icon */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* ─── Right Section ────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          whileTap={{ scale: 0.9, rotate: 15 }}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            {theme === 'light' ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="h-[18px] w-[18px]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="h-[18px] w-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <motion.button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            whileTap={{ scale: 0.9 }}
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50"
              >
                {/* Dropdown Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                      <Check className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[340px] overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-10">
                      <Bell className="mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium text-slate-400">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    recentNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          markAsRead(notification.id);
                          if (notification.link) {
                            navigate(notification.link);
                          }
                          setNotificationsOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                          !notification.read && 'bg-blue-50/30'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                            notification.read ? 'bg-transparent' : 'bg-blue-500'
                          )}
                        />
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-sm font-medium text-slate-700">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[10px] font-medium text-slate-400">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Dropdown Footer */}
                <div className="border-t border-slate-100">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/notifications');
                    }}
                    className="flex w-full items-center justify-center py-3 text-xs font-semibold text-blue-600 transition-colors hover:bg-slate-50 hover:text-blue-700"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* User Profile Avatar + Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-slate-100"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white ring-2 ring-slate-100">
                {getInitials(user?.name ?? 'U')}
              </div>
            )}
            <div className="hidden flex-col text-left md:flex">
              <span className="text-sm font-semibold leading-tight text-slate-700">
                {user?.name ?? 'User'}
              </span>
              <span className="text-[10px] font-medium leading-tight text-slate-400">
                {user?.role
                  ? user.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                  : 'User'}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50"
              >
                {/* User Info Header */}
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.name ?? 'User'}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {user?.email ?? ''}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 p-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
