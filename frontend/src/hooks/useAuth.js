import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Custom hook to consume AuthContext.
 * Must be used within an <AuthProvider>.
 *
 * @returns {{
 *   user: object|null,
 *   token: string|null,
 *   loading: boolean,
 *   login: Function,
 *   logout: Function,
 *   register: Function,
 *   isAuthenticated: boolean,
 *   isTeacher: boolean,
 *   isStudent: boolean,
 *   isAdmin: boolean,
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return context
}
