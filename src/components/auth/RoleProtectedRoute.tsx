import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

const ROLE_HOME: Record<UserRole, string> = {
  super_admin:          '/dashboard',
  admission_officer:    '/dashboard',
  verification_officer: '/dashboard',
  student:              '/my-application',
  parent:               '/dashboard',
}

interface Props {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RoleProtectedRoute({ children, allowedRoles }: Props) {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  // Still resolving auth — show nothing (ProtectedRoute above handles loader)
  if (isLoading) return null

  // Not logged in — ProtectedRoute above handles redirect to /login
  if (!isAuthenticated || !user) return null

  // Role not allowed — redirect silently to their home
  if (!allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to={ROLE_HOME[user.role as UserRole] ?? '/dashboard'} replace />
  }

  return <>{children}</>
}
