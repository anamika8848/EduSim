import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import api from '../services/api'
import { getEmailFromToken, isTokenExpired } from '../utils/jwtUtils'
import { STORAGE_KEYS, ROLES, ROUTES } from '../utils/constants'

/* ── Context creation ────────────────────────────────────────── */
export const AuthContext = createContext(null)

/* ── Provider ────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN))
  const [user,  setUser]    = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  /* ── Validate stored token and fetch user profile on mount ── */
  useEffect(() => {
    async function initializeAuth() {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)

      if (!storedToken || isTokenExpired(storedToken)) {
        // No valid token – clear everything
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        setToken(null)
        setUser(null)
        setLoading(false)
        return
      }

      // Token exists and is not client-side expired – verify with backend
      try {
        const response = await userService.getProfile()
        const verifiedUser = response.data
        setToken(storedToken)
        setUser(verifiedUser)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(verifiedUser))
      } catch (err) {
        console.warn('[AuthContext] Backend validation failed on mount:', err)
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  /* ── Persist helpers ─────────────────────────────────────────── */
  const persistAuth = useCallback((tkn, usr) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, tkn)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(usr))
    setToken(tkn)
    setUser(usr)
  }, [])

  /* ── Resolve user object from token ─────────────────────────── */
  /**
   * After login we only get a JWT token from the backend.
   * To get the full user object (id, role, name…) we:
   *  1. Temporarily store the token so api.js can attach it as Bearer.
   *  2. Fetch /api/users/students and /api/users/teachers.
   *  3. Match by email extracted from the token's `sub` claim.
   *  4. Fall back to a minimal user object if not found (Admin case).
   */
  const resolveUserFromToken = useCallback(async (tkn) => {
    // Temporarily put token in localStorage so the api interceptor picks it up
    localStorage.setItem(STORAGE_KEYS.TOKEN, tkn)
    try {
      const response = await userService.getProfile()
      return response.data
    } catch (err) {
      console.warn('[AuthContext] Could not resolve user profile from token:', err)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      throw err
    }
  }, [])

  /* ── Login ───────────────────────────────────────────────────── */
  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const response = await authService.login(email, password)
      const tkn = response.data?.token ?? response.data

      if (!tkn) throw new Error('No token received from server')

      // Resolve full user object
      const resolvedUser = await resolveUserFromToken(tkn)

      persistAuth(tkn, resolvedUser)
      toast.success(`Welcome back, ${resolvedUser.fullName ?? resolvedUser.email}! 👋`)

      return { success: true, user: resolvedUser }
    } catch (err) {
      const message =
        err.response?.data?.message ??
        err.response?.data ??
        err.message ??
        'Login failed. Please check your credentials.'
      toast.error(String(message))
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [persistAuth, resolveUserFromToken])

  /* ── Register ────────────────────────────────────────────────── */
  const register = useCallback(async (fullName, email, password, role) => {
    setLoading(true)
    try {
      if (role === ROLES.ADMIN) {
        throw new Error('Public registration for Admin accounts is not permitted.')
      }
      const response = await authService.register(fullName, email, password, role)
      const registeredUser = response.data
      toast.success('Account created successfully! Please log in.')
      return { success: true, user: registeredUser }
    } catch (err) {
      const message =
        err.response?.data?.message ??
        err.response?.data ??
        err.message ??
        'Registration failed. Please try again.'
      toast.error(String(message))
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Logout ──────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)

    // Clear dynamic Axios authorization headers
    delete api.defaults.headers.common.Authorization

    setToken(null)
    setUser(null)
    setLoading(false)
    toast.success('Logged out successfully.')
    window.location.replace(ROUTES.LANDING)
  }, [])

  /* ── Derived state ───────────────────────────────────────────── */
  const isAuthenticated = !!token && !!user && !isTokenExpired(token)
  const isTeacher       = user?.role === ROLES.TEACHER
  const isStudent       = user?.role === ROLES.STUDENT
  const isAdmin         = user?.role === ROLES.ADMIN

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated,
    isTeacher,
    isStudent,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
