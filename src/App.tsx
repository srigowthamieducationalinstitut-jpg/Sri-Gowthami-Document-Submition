import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuthStore } from '@/store/authStore'
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute'

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ApplicationsPage = lazy(() => import('@/pages/ApplicationsPage'))
const ApplicationDetailPage = lazy(() => import('@/pages/ApplicationDetailPage'))
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'))
const VerificationPage = lazy(() => import('@/pages/VerificationPage'))
const StudentPortalPage = lazy(() => import('@/pages/StudentPortalPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const HomePage = lazy(() => import('@/pages/public/HomePage'))

// Loading fallback with skeleton
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) {
    return <PageLoader />
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Standalone Protected Routes (No MainLayout) */}
        <Route
          path="/my-application"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['student']}>
                <StudentPortalPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Protected routes with MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Everyone logged in */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Admin + Officer + Verifier only */}
          <Route path="applications" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admission_officer', 'verification_officer']}>
              <ApplicationsPage />
            </RoleProtectedRoute>
          } />
          <Route path="applications/:id" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admission_officer', 'verification_officer']}>
              <ApplicationDetailPage />
            </RoleProtectedRoute>
          } />
          <Route path="documents" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admission_officer', 'verification_officer']}>
              <DocumentsPage />
            </RoleProtectedRoute>
          } />
          <Route path="verification" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admission_officer', 'verification_officer']}>
              <VerificationPage />
            </RoleProtectedRoute>
          } />

          {/* Admin + Officer only */}
          <Route path="students" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admission_officer']}>
              <ApplicationsPage />
            </RoleProtectedRoute>
          } />
          <Route path="reports" element={
            <RoleProtectedRoute allowedRoles={['super_admin', 'admission_officer']}>
              <ReportsPage />
            </RoleProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="admin" element={
            <RoleProtectedRoute allowedRoles={['super_admin']}>
              <AdminPage />
            </RoleProtectedRoute>
          } />

          {/* Student only */}
          <Route path="my-documents" element={
            <RoleProtectedRoute allowedRoles={['student']}>
              <DocumentsPage />
            </RoleProtectedRoute>
          } />
          <Route path="application-status" element={
            <RoleProtectedRoute allowedRoles={['student']}>
              <StudentPortalPage />
            </RoleProtectedRoute>
          } />

          {/* AI Assistant — all roles */}
          <Route path="ai-assistant" element={<DashboardPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
