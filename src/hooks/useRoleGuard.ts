import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

// Define which roles are allowed per route
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard':          ['super_admin', 'admission_officer', 'verification_officer', 'student'],
  '/applications':       ['super_admin', 'admission_officer', 'verification_officer'],
  '/documents':          ['super_admin', 'admission_officer', 'verification_officer'],
  '/my-documents':       ['student'],
  '/verification':       ['super_admin', 'admission_officer', 'verification_officer'],
  '/students':           ['super_admin', 'admission_officer'],
  '/reports':            ['super_admin', 'admission_officer'],
  '/admin':              ['super_admin'],
  '/notifications':      ['super_admin', 'admission_officer', 'verification_officer', 'student'],
  '/student-hub':        ['student'],
  '/my-application':     ['student'],
  '/application-status': ['student'],
}

// Default redirect per role when they hit a forbidden page
const ROLE_HOME: Record<UserRole, string> = {
  super_admin:          '/dashboard',
  admission_officer:    '/dashboard',
  verification_officer: '/dashboard',
  student:              '/my-application',
  parent:               '/dashboard',
}

export function useRoleGuard(currentPath: string) {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const role = user.role as UserRole
    const allowedRoles = ROUTE_PERMISSIONS[currentPath]

    // Route not in permission map → deny everyone
    if (!allowedRoles) {
      navigate(ROLE_HOME[role] ?? '/dashboard', { replace: true })
      return
    }

    // User's role not in allowed list → redirect to their home
    if (!allowedRoles.includes(role)) {
      navigate(ROLE_HOME[role] ?? '/dashboard', { replace: true })
    }
  }, [user, isAuthenticated, currentPath, navigate])
}
