import api from './api'

/**
 * User service
 * Wraps all /users endpoints.
 */
export const userService = {
  /** Fetch all registered students */
  getStudents: () => api.get('/users/students'),

  /** Fetch all registered teachers */
  getTeachers: () => api.get('/users/teachers'),

  /** Fetch a specific user by ID */
  getById: (id) => api.get(`/users/${id}`),

  /** Fetch currently logged in user profile */
  getProfile: () => api.get('/users/profile'),
}
