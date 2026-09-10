import axios from 'axios'
import toast from 'react-hot-toast'

/**
 * Axios instance pre-configured for the EduSim API.
 * All requests go to `/api` which Vite proxies to http://localhost:8080.
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/* ── Request interceptor ─────────────────────────────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edusim_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response interceptor ────────────────────────────────────── */
api.interceptors.response.use(
  // Success: pass through transparently
  (response) => response,

  // Error: handle globally
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Clear stale auth data
      localStorage.removeItem('edusim_token')
      localStorage.removeItem('edusim_user')

      // Notify the user
      toast.error('Session expired. Please log in again.')

      // Redirect to login (works outside React tree too)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (status === 404) {
      // 404s are usually handled by the calling component; don't show a global toast
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      // Network error (no response at all)
      toast.error('Network error. Is the server running?')
    }

    return Promise.reject(error)
  }
)

export default api
