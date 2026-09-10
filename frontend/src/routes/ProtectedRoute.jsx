import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '../utils/constants'

/**
 * ProtectedRoute
 *
 * Guards a set of nested routes:
 *  - Unauthenticated users → /login
 *  - Wrong role             → /unauthorized
 *  - Otherwise             → renders <Outlet />
 *
 * Props:
 *  @param {string} [requiredRole] - 'STUDENT' | 'TEACHER' | 'ADMIN'
 *    If omitted, any authenticated user is allowed.
 */
function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth()

  // While we might be rehydrating auth from localStorage, show nothing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: 'var(--accent-blue)',
            borderRightColor: 'var(--accent-purple)',
          }}
        />
      </div>
    )
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Role check
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
