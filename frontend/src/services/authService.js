import api from './api'

/**
 * Authentication service
 * Wraps all /auth endpoints.
 */
export const authService = {
  /**
   * Log in with email + password.
   * Returns `{ token: string }` on success.
   */
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  /**
   * Register a new user.
   * Returns the created user object on success.
   */
  register: (fullName, email, password, role) =>
    api.post('/auth/register', { fullName, email, password, role }),
}
