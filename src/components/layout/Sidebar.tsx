// ============================================
// Sidebar — Premium Collapsible Navigation
// ============================================
import { useCallback, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  FolderOpen,
  ShieldCheck,
  Users,
  ClipboardList,
  Bell,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useDocumentStore } from '@/store/documentStore';
import { cn, getInitials } from '@/lib/utils';

// ─── Nav Item Definition ─────────────────────
interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  roles: UserRole[] | 'all';
  section?: 'main' | 'system';
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['super_admin', 'admission_officer', 'verification_officer', 'student', 'parent'],
    section: 'main',
  },
  {
    label: 'Applications',
    icon: FileText,
    path: '/applications',
    roles: ['super_admin', 'admission_officer'],
    section: 'main',
  },
  {
    label: 'My Application',
    icon: FileText,
    path: '/my-application',
    roles: ['student'],
    section: 'main',
  },
  {
    label: 'Documents',
    icon: FolderOpen,
    path: '/documents',
    roles: ['super_admin', 'admission_officer', 'verification_officer'],
    section: 'main',
  },
  {
    label: 'My Documents',
    icon: FolderOpen,
    path: '/my-documents',
    roles: ['student'],
    section: 'main',
  },
  {
    label: 'Verification',
    icon: ShieldCheck,
    path: '/verification',
    roles: ['super_admin', 'admission_officer', 'verification_officer'],
    section: 'main',
  },
  {
    label: 'Students',
    icon: Users,
    path: '/students',
    roles: ['super_admin', 'admission_officer'],
    section: 'main',
  },
  {
    label: 'Application Status',
    icon: ClipboardList,
    path: '/application-status',
    roles: ['student'],
    section: 'main',
  },
  {
    label: 'Notifications',
    icon: Bell,
    path: '/notifications',
    roles: 'all',
    section: 'main',
  },
  {
    label: 'Reports',
    icon: BarChart3,
    path: '/reports',
    roles: ['super_admin', 'admission_officer'],
    section: 'main',
  },
  {
    label: 'AI Assistant',
    icon: Bot,
    path: '/ai-assistant',
    roles: 'all',
    section: 'system',
  },
  {
    label: 'Admin',
    icon: Settings,
    path: '/admin',
    roles: ['super_admin'],
    section: 'system',
  },
];

// ─── Role Badge Colors ───────────────────────
const roleBadgeStyles: Record<UserRole, string> = {
  super_admin: 'bg-rose-50 text-rose-700 ring-rose-200',
  admission_officer: 'bg-blue-50 text-blue-700 ring-blue-200',
  verification_officer: 'bg-amber-50 text-amber-700 ring-amber-200',
  student: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  parent: 'bg-violet-50 text-violet-700 ring-violet-200',
};

const roleDisplayName: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admission_officer: 'Admissions',
  verification_officer: 'Verification',
  student: 'Student',
  parent: 'Parent',
};

// ─── Sidebar Component ──────────────────────
export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, collapseSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const { documents } = useDocumentStore();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.role ?? 'student';

  // Check verification status for student
  const isVerificationComplete = useMemo(() => {
    if (userRole !== 'student') return false;
    
    // Fetch dynamically created application from session storage if it exists, otherwise use user's app
    let sessionApp = null;
    try {
      const stored = sessionStorage.getItem('sg_mock_app');
      if (stored) sessionApp = JSON.parse(stored);
    } catch {}
    const appId = user?.applicationId || sessionApp?.id || 'app_001';
    
    const localDocs = documents.filter(d => d.applicationId === appId);
    const mandatoryTypes = [
      'aadhaar', 'marks_memo_10', 'marks_memo_12', 'tc_10', 'tc_12',
      'passport_photo', 'bonafide_10', 'bonafide_12'
    ];
    const mandatoryDocs = localDocs.filter(d => mandatoryTypes.includes(d.type));
    return mandatoryDocs.length === mandatoryTypes.length && mandatoryDocs.every(d => d.status === 'verified');
  }, [userRole, documents, user?.applicationId]);

  // Filter navigation items based on user role
  const filteredItems = useMemo(
    () =>
      navItems.filter(
        (item) => {
          if (item.roles !== 'all' && !item.roles.includes(userRole)) return false;
          
          if (userRole === 'student') {
            // Hide My Application (Admission Wizard) if already verified
            if (item.path === '/my-application' && isVerificationComplete) return false;
            // Hide Dashboard if NOT verified
            if (item.path === '/dashboard' && !isVerificationComplete) return false;
            // Map dashboard out since we use specific paths
            if (item.path === '/dashboard') return false;
          }
          return true;
        }
      ),
    [userRole, isVerificationComplete]
  );

  const mainItems = useMemo(
    () => filteredItems.filter((item) => item.section === 'main'),
    [filteredItems]
  );

  const systemItems = useMemo(
    () => filteredItems.filter((item) => item.section === 'system'),
    [filteredItems]
  );

  // Close mobile sidebar on route change
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const sidebarWidth = sidebarCollapsed ? 72 : 280;

  // ─── Render Nav Item ─────────────────────
  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className="block"
      >
        <motion.div
          className={cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
            'hover:bg-blue-50/70',
            isActive
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:text-slate-900',
            sidebarCollapsed && 'justify-center px-0'
          )}
          whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active indicator bar */}
          {isActive && (
            <motion.div
              className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-600"
              layoutId="sidebar-active-indicator"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}

          <item.icon
            className={cn(
              'h-[18px] w-[18px] shrink-0 transition-colors duration-200',
              isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
            )}
          />

          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="truncate whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip when collapsed */}
          {sidebarCollapsed && (
            <div className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
              {item.label}
              <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900" />
            </div>
          )}
        </motion.div>
      </NavLink>
    );
  };

  // ─── Sidebar Content ──────────────────────
  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className={cn(
        'flex items-center gap-3 border-b border-slate-100 px-5 py-5',
        sidebarCollapsed && 'justify-center px-3'
      )}>
        <img src="/logo.png" className="h-9 w-9 shrink-0 object-contain rounded-xl" alt="Sri Gowthami Logo" />
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold tracking-tight text-slate-900">
                Sri Gowthami
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Student Tracker
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {/* Main Section Label */}
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        <div className="space-y-0.5">
          {mainItems.map(renderNavItem)}
        </div>

        {/* Separator */}
        {systemItems.length > 0 && (
          <div className="my-4 border-t border-slate-100" />
        )}

        {/* System Section Label */}
        {systemItems.length > 0 && (
          <>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
                >
                  System
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-0.5">
              {systemItems.map(renderNavItem)}
            </div>
          </>
        )}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-slate-100 p-3">
        {/* Profile Card */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50',
            sidebarCollapsed && 'justify-center p-2'
          )}
        >
          {/* Avatar */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white ring-2 ring-white shadow-sm">
              {getInitials(user?.name ?? 'U')}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <span className="truncate text-sm font-semibold text-slate-800">
                  {user?.name ?? 'User'}
                </span>
                <span
                  className={cn(
                    'mt-0.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1',
                    roleBadgeStyles[userRole]
                  )}
                >
                  {roleDisplayName[userRole]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            'mt-1.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Collapse Toggle (desktop only) */}
        <button
          onClick={collapseSidebar}
          className="mt-1.5 hidden w-full items-center justify-center rounded-xl border border-slate-200 py-2 text-slate-400 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600 md:flex"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="ml-2 text-xs font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ────────────────── */}
      <motion.aside
        className="fixed left-0 top-0 z-40 hidden h-screen border-r border-slate-200/80 bg-white/80 backdrop-blur-xl backdrop-saturate-150 md:block"
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {sidebarContent}
      </motion.aside>

      {/* ─── Mobile Overlay ─────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-in Sidebar */}
            <motion.aside
              className="fixed left-0 top-0 z-50 h-screen w-[280px] border-r border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl backdrop-saturate-150 md:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
